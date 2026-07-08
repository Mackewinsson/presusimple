import {
  capBroadcastErrors,
  serializeNotificationBroadcast,
} from "@/lib/admin/notification-broadcast-utils";
import {
  PUSH_SUBSCRIBER_FILTER,
  PUSH_SUBSCRIPTION_EXISTS_FILTER,
} from "@/lib/admin/notification-filters";

describe("notification-recipients filters", () => {
  it("requires a valid endpoint and enabled notifications for active subscribers", () => {
    expect(PUSH_SUBSCRIBER_FILTER).toEqual({
      pushSubscription: { $exists: true, $ne: null },
      "pushSubscription.endpoint": { $exists: true, $ne: null },
      notificationEnabled: true,
    });
  });

  it("counts total subscriptions without requiring notificationEnabled", () => {
    expect(PUSH_SUBSCRIPTION_EXISTS_FILTER).toEqual({
      pushSubscription: { $exists: true, $ne: null },
      "pushSubscription.endpoint": { $exists: true, $ne: null },
    });
    expect(PUSH_SUBSCRIBER_FILTER.notificationEnabled).toBe(true);
  });
});

describe("notification broadcast helpers", () => {
  it("serializes broadcast history entries", () => {
    const createdAt = new Date("2026-07-08T12:00:00.000Z");

    expect(
      serializeNotificationBroadcast({
        _id: "abc123",
        title: "Hello",
        body: "World",
        recipientCount: 5,
        sentCount: 4,
        failedCount: 1,
        createdAt,
      })
    ).toEqual({
      id: "abc123",
      title: "Hello",
      body: "World",
      sentAt: createdAt.toISOString(),
      recipients: 5,
      sentCount: 4,
      failedCount: 1,
      success: false,
    });
  });

  it("marks success when no deliveries failed", () => {
    expect(
      serializeNotificationBroadcast({
        _id: "ok",
        title: "Done",
        body: "All good",
        recipientCount: 2,
        sentCount: 2,
        failedCount: 0,
        createdAt: new Date("2026-07-08T12:00:00.000Z"),
      }).success
    ).toBe(true);
  });

  it("caps stored broadcast errors", () => {
    const errors = Array.from({ length: 25 }, (_, index) => `error-${index}`);
    expect(capBroadcastErrors(errors)).toHaveLength(20);
  });
});
