import type { NotificationBatchResult } from "@/lib/notifications";

export const MAX_STORED_ERRORS = 20;

export function capBroadcastErrors(errors: string[]): string[] {
  return errors.slice(0, MAX_STORED_ERRORS);
}

export interface NotificationHistoryEntry {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  recipients: number;
  sentCount: number;
  failedCount: number;
  success: boolean;
}

export function serializeNotificationBroadcast(
  broadcast: {
    _id: unknown;
    title: string;
    body: string;
    recipientCount: number;
    sentCount: number;
    failedCount: number;
    createdAt: Date | string;
  }
): NotificationHistoryEntry {
  return {
    id: String(broadcast._id),
    title: broadcast.title,
    body: broadcast.body,
    sentAt:
      broadcast.createdAt instanceof Date
        ? broadcast.createdAt.toISOString()
        : new Date(broadcast.createdAt).toISOString(),
    recipients: broadcast.recipientCount,
    sentCount: broadcast.sentCount,
    failedCount: broadcast.failedCount,
    success: broadcast.failedCount === 0,
  };
}

export interface NotificationBroadcastInput {
  title: string;
  body: string;
  url: string;
  sentBy: string;
  result: NotificationBatchResult;
  recipientCount: number;
}
