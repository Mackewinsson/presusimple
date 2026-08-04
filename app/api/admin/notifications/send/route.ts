import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { requireAdminApi } from "@/lib/auth/admin";
import {
  getPushSubscribers,
  pruneStalePushSubscriptions,
} from "@/lib/admin/notification-recipients";
import { recordNotificationBroadcast } from "@/lib/admin/notification-broadcast";
import {
  isStaleSubscriptionError,
  sendNotificationToRecipients,
  type NotificationPayload,
} from "@/lib/notifications";

function buildNotificationPayload(
  notificationData: Record<string, unknown>
): NotificationPayload {
  const url = (notificationData.url as string) || "/budget";

  return {
    title: notificationData.title as string,
    body: notificationData.body as string,
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
        {
          action: "view",
          title: "View Details",
          url,
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ]
    ).map((action) => ({
      ...action,
      url: (action.url as string) || url,
    })) as NotificationPayload["actions"],
    requireInteraction: Boolean(notificationData.requireInteraction),
    silent: Boolean(notificationData.silent),
    tag: (notificationData.tag as string) || "admin-notification",
    renotify: Boolean(notificationData.renotify),
    vibrate: (notificationData.vibrate as number[]) || [200, 100, 200],
    mutable: notificationData.mutable !== false,
    appBadge: notificationData.appBadge as number | undefined,
  };
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const notificationData = await request.json();

    if (!notificationData?.title || !notificationData?.body) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const recipients = await getPushSubscribers();
    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No users subscribed to push notifications" },
        { status: 400 }
      );
    }

    const payload = buildNotificationPayload(notificationData);
    const result = await sendNotificationToRecipients(recipients, payload);

    const staleUserIds = result.failures
      .filter((failure) => isStaleSubscriptionError(failure.statusCode))
      .map((failure) => failure.userId);

    if (staleUserIds.length > 0) {
      await pruneStalePushSubscriptions(staleUserIds);
    }

    await recordNotificationBroadcast({
      title: notificationData.title,
      body: notificationData.body,
      url: payload.url || "/budget",
      sentBy: auth.session.user.email!,
      recipientCount: recipients.length,
      result,
    });

    const stats = {
      sent: result.sent,
      failed: result.failed,
      total: recipients.length,
      pruned: staleUserIds.length,
    };

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Notification sent successfully to ${result.sent} users`,
        stats,
      });
    }

    return NextResponse.json(
      {
        error: "Some notifications failed to send",
        stats,
        errors: result.errors,
      },
      { status: 207 }
    );
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
