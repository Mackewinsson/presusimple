import NotificationBroadcast, {
  type INotificationBroadcast,
} from "@/models/NotificationBroadcast";
import {
  capBroadcastErrors,
  type NotificationBroadcastInput,
} from "@/lib/admin/notification-broadcast-utils";

export async function recordNotificationBroadcast(
  input: NotificationBroadcastInput
): Promise<INotificationBroadcast> {
  return NotificationBroadcast.create({
    title: input.title,
    body: input.body,
    url: input.url,
    sentBy: input.sentBy,
    recipientCount: input.recipientCount,
    sentCount: input.result.sent,
    failedCount: input.result.failed,
    deliveryErrors: capBroadcastErrors(input.result.errors),
  });
}
