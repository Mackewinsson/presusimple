import User from "@/models/User";
import {
  PUSH_SUBSCRIBER_FILTER,
  PUSH_SUBSCRIPTION_EXISTS_FILTER,
} from "@/lib/admin/notification-filters";

export {
  PUSH_SUBSCRIBER_FILTER,
  PUSH_SUBSCRIPTION_EXISTS_FILTER,
} from "@/lib/admin/notification-filters";

export interface PushSubscriber {
  userId: string;
  subscription: Record<string, unknown>;
}

export async function getPushSubscribers(): Promise<PushSubscriber[]> {
  const users = await User.find(PUSH_SUBSCRIBER_FILTER)
    .select("_id pushSubscription")
    .lean();

  return users
    .filter((user) => user.pushSubscription)
    .map((user) => ({
      userId: String(user._id),
      subscription: user.pushSubscription as Record<string, unknown>,
    }));
}

export async function countTotalPushSubscriptions(): Promise<number> {
  return User.countDocuments(PUSH_SUBSCRIPTION_EXISTS_FILTER);
}

export async function countActivePushSubscribers(): Promise<number> {
  return User.countDocuments(PUSH_SUBSCRIBER_FILTER);
}

export async function pruneStalePushSubscriptions(userIds: string[]): Promise<number> {
  if (userIds.length === 0) return 0;

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    {
      $unset: { pushSubscription: 1 },
      $set: { notificationEnabled: false },
    }
  );

  return result.modifiedCount;
}
