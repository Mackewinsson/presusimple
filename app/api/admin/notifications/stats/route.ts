import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { requireAdminApi } from "@/lib/auth/admin";
import {
  countActivePushSubscribers,
  countTotalPushSubscriptions,
} from "@/lib/admin/notification-recipients";
import NotificationBroadcast from "@/models/NotificationBroadcast";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();

    const [totalSubscribers, activeSubscribers, notificationsSent, lastBroadcast] =
      await Promise.all([
        countTotalPushSubscriptions(),
        countActivePushSubscribers(),
        NotificationBroadcast.countDocuments(),
        NotificationBroadcast.findOne()
          .sort({ createdAt: -1 })
          .select("createdAt")
          .lean<{ createdAt?: Date } | null>(),
      ]);

    return NextResponse.json({
      totalSubscribers,
      activeSubscribers,
      notificationsSent,
      lastNotificationSent: lastBroadcast?.createdAt ?? null,
    });
  } catch (error) {
    console.error("Error getting notification stats:", error);
    return NextResponse.json(
      { error: "Failed to get notification statistics" },
      { status: 500 }
    );
  }
}
