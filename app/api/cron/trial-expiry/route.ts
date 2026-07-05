import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { sendTrialExpiryEmail } from "@/lib/email";
import { calculateTrialDaysLeft } from "@/lib/utils";

function isAuthorizedCron(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return process.env.NODE_ENV === "development";
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Daily cron: send trial expiry warning (3 days left) and expired notices.
 * Secured with CRON_SECRET via Authorization: Bearer header (Vercel Cron).
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const now = new Date();
    const users = await User.find({
      isPaid: { $ne: true },
      trialEnd: { $exists: true, $ne: null },
      email: { $exists: true, $ne: "" },
    });

    let warningsSent = 0;
    let expiredSent = 0;
    let failed = 0;

    for (const user of users) {
      if (!user.trialEnd || !user.email) continue;

      const daysLeft = calculateTrialDaysLeft(user.trialEnd);
      const trialEnd = new Date(user.trialEnd);
      const hoursSinceExpiry =
        (now.getTime() - trialEnd.getTime()) / (1000 * 60 * 60);

      let shouldSend = false;
      let emailDaysLeft = daysLeft;

      if (daysLeft === 3) {
        shouldSend = true;
        emailDaysLeft = 3;
      } else if (daysLeft <= 0 && hoursSinceExpiry >= 0 && hoursSinceExpiry <= 24) {
        shouldSend = true;
        emailDaysLeft = 0;
      }

      if (!shouldSend) continue;

      const result = await sendTrialExpiryEmail(
        user.email,
        user.name,
        emailDaysLeft
      );

      if (result.success || result.skipped) {
        if (emailDaysLeft === 3) warningsSent += 1;
        else expiredSent += 1;
      } else {
        failed += 1;
        console.error(
          `[cron/trial-expiry] Failed for ${user.email}:`,
          result.error
        );
      }
    }

    return NextResponse.json({
      message: "Trial expiry emails processed",
      warningsSent,
      expiredSent,
      failed,
      processedUsers: users.length,
    });
  } catch (error) {
    console.error("[cron/trial-expiry] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
