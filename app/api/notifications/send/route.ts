import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { pruneStalePushSubscriptions } from "@/lib/admin/notification-recipients";
import {
  sendNotificationToUser,
  sendTestNotification,
  type NotificationPayload,
} from "@/lib/notifications";

const STALE_SUBSCRIPTION_MESSAGE =
  "Your push subscription expired. Open the app and enable notifications again.";

function isStaleSubscriptionStatus(statusCode?: number): boolean {
  return statusCode === 410 || statusCode === 404;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationData = await request.json();

    if (!notificationData) {
      return NextResponse.json(
        { error: "Invalid notification data" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.pushSubscription) {
      return NextResponse.json(
        {
          error: "User not subscribed to notifications",
          code: "not_subscribed",
          needsResubscribe: true,
        },
        { status: 400 }
      );
    }

    const result =
      notificationData.type === "test"
        ? await sendTestNotification(
            user.pushSubscription,
            notificationData.message
          )
        : await sendNotificationToUser(
            user.pushSubscription,
            buildCustomPayload(notificationData)
          );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Notification sent successfully",
      });
    }

    if (isStaleSubscriptionStatus(result.statusCode)) {
      await pruneStalePushSubscriptions([String(user._id)]);

      return NextResponse.json(
        {
          error: STALE_SUBSCRIPTION_MESSAGE,
          code: "subscription_expired",
          needsResubscribe: true,
        },
        { status: 410 }
      );
    }

    return NextResponse.json(
      { error: result.error || "Failed to send notification" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

function buildCustomPayload(
  notificationData: Record<string, unknown>
): NotificationPayload {
  const url = (notificationData.url as string) || "/budget";

  return {
    title: (notificationData.title as string) || "Budget App Notification",
    body: (notificationData.body as string) || "You have a new notification",
    icon: (notificationData.icon as string) || "/icons/icon-192x192.png",
    badge: (notificationData.badge as string) || "/icons/icon-72x72.png",
    url,
    defaultActionUrl:
      (notificationData.defaultActionUrl as string) ||
      (notificationData.url as string) ||
      "/budget",
    data: (notificationData.data as Record<string, unknown>) || {},
    actions: (
      (notificationData.actions as Array<Record<string, unknown>>) || [
        { action: "view", title: "View Details", url },
        { action: "dismiss", title: "Dismiss" },
      ]
    ).map((action) => ({
      ...action,
      url: (action.url as string) || url,
    })) as NotificationPayload["actions"],
    requireInteraction: Boolean(notificationData.requireInteraction),
    silent: Boolean(notificationData.silent),
    tag: (notificationData.tag as string) || "budget-notification",
    renotify: Boolean(notificationData.renotify),
    vibrate: (notificationData.vibrate as number[]) || [200, 100, 200],
    mutable: notificationData.mutable !== false,
    appBadge: notificationData.appBadge as number | undefined,
  };
}
