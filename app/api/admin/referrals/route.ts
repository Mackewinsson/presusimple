import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET() {
  try {
    const authResult = await requireAdminApi();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await dbConnect();

    // Fetch referrers (users with referralCode and referred users count)
    const usersWithReferrals = await User.find({
      $or: [{ referralCode: { $exists: true, $ne: null } }, { referredBy: { $exists: true, $ne: null } }],
    }).select("email name referralCode referredBy plan isPaid trialEnd createdAt");

    // Group referrals by referrer
    const referrersMap: Record<string, { user: any; referredUsers: any[] }> = {};

    usersWithReferrals.forEach((u) => {
      if (u.referralCode) {
        if (!referrersMap[u.referralCode]) {
          referrersMap[u.referralCode] = { user: u, referredUsers: [] };
        } else {
          referrersMap[u.referralCode].user = u;
        }
      }
    });

    usersWithReferrals.forEach((u) => {
      if (u.referredBy && referrersMap[u.referredBy]) {
        referrersMap[u.referredBy].referredUsers.push(u);
      }
    });

    const referralList = Object.entries(referrersMap).map(([code, data]) => ({
      referralCode: code,
      referrer: data.user
        ? { id: data.user._id, email: data.user.email, name: data.user.name, plan: data.user.plan }
        : null,
      referredCount: data.referredUsers.length,
      referredUsers: data.referredUsers.map((ru) => ({
        id: ru._id,
        email: ru.email,
        name: ru.name,
        plan: ru.plan,
        createdAt: ru.createdAt,
      })),
    }));

    const totalReferrers = Object.keys(referrersMap).length;
    const totalReferredUsers = usersWithReferrals.filter((u) => u.referredBy).length;

    return NextResponse.json({
      totalReferrers,
      totalReferredUsers,
      referralList,
    });
  } catch (error) {
    console.error("Error fetching admin referrals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireAdminApi();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { userId, bonusDays = 30 } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const currentEnd = user.trialEnd && new Date(user.trialEnd) > now ? new Date(user.trialEnd) : now;
    const newEnd = new Date(currentEnd.getTime() + bonusDays * 24 * 60 * 60 * 1000);

    user.trialEnd = newEnd;
    user.plan = "pro";
    user.subscriptionType = "referral_bonus";
    await user.save();

    return NextResponse.json({
      message: `Granted ${bonusDays} days referral Pro bonus to ${user.email}`,
      trialEnd: user.trialEnd,
    });
  } catch (error) {
    console.error("Error granting referral bonus:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
