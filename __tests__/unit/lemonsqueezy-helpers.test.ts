import {
  mapSubscriptionToUserUpdate,
  resolveWebhookUserEmail,
  verifyWebhookSignature,
} from "@/lib/lemonsqueezy";
import crypto from "node:crypto";

describe("Lemon Squeezy helpers", () => {
  describe("mapSubscriptionToUserUpdate", () => {
    it("maps active subscription to pro", () => {
      const update = mapSubscriptionToUserUpdate(
        {
          status: "active",
          user_email: "user@example.com",
          customer_id: 42,
        },
        "99"
      );

      expect(update).toEqual({
        lemonSqueezyCustomerId: "42",
        lemonSqueezySubscriptionId: "99",
        isPaid: true,
        plan: "pro",
        subscriptionType: "lemon_squeezy",
      });
    });

    it("maps cancelled subscription to pro during grace period", () => {
      const update = mapSubscriptionToUserUpdate(
        {
          status: "cancelled",
          user_email: "user@example.com",
          customer_id: 42,
        },
        "99"
      );

      expect(update.plan).toBe("pro");
      expect(update.isPaid).toBe(true);
    });

    it("maps expired subscription to free", () => {
      const update = mapSubscriptionToUserUpdate(
        {
          status: "expired",
          user_email: "user@example.com",
          customer_id: 42,
        },
        "99"
      );

      expect(update.plan).toBe("free");
      expect(update.isPaid).toBe(false);
    });
  });

  describe("resolveWebhookUserEmail", () => {
    it("prefers attributes.user_email", () => {
      expect(
        resolveWebhookUserEmail(
          { user_email: "user@example.com", status: "active", customer_id: 1 },
          { custom_data: { user_email: "other@example.com" } }
        )
      ).toBe("user@example.com");
    });

    it("falls back to meta.custom_data object", () => {
      expect(
        resolveWebhookUserEmail(undefined, {
          custom_data: { user_email: "user@example.com" },
        })
      ).toBe("user@example.com");
    });

    it("falls back to meta.custom_data JSON string", () => {
      expect(
        resolveWebhookUserEmail(undefined, {
          custom_data: JSON.stringify({ user_email: "user@example.com" }),
        })
      ).toBe("user@example.com");
    });

    it("returns null when no email is available", () => {
      expect(resolveWebhookUserEmail(undefined, {})).toBeNull();
    });
  });

  describe("verifyWebhookSignature", () => {
    it("accepts valid signatures", () => {
      const secret = "test-secret";
      const body = JSON.stringify({ hello: "world" });
      const signature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      expect(verifyWebhookSignature(body, signature, secret)).toBe(true);
    });

    it("rejects invalid signatures", () => {
      expect(
        verifyWebhookSignature("{}", "invalid-signature", "test-secret")
      ).toBe(false);
    });
  });
});
