export const PUSH_SUBSCRIBER_FILTER = {
  pushSubscription: { $exists: true, $ne: null },
  "pushSubscription.endpoint": { $exists: true, $ne: null },
  notificationEnabled: true,
} as const;

export const PUSH_SUBSCRIPTION_EXISTS_FILTER = {
  pushSubscription: { $exists: true, $ne: null },
  "pushSubscription.endpoint": { $exists: true, $ne: null },
} as const;
