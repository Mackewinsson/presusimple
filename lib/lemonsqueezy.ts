import crypto from "node:crypto";
import {
  createCheckout,
  getSubscription,
  lemonSqueezySetup,
} from "@lemonsqueezy/lemonsqueezy.js";

let initialized = false;

export type LemonSubscriptionStatus =
  | "on_trial"
  | "active"
  | "paused"
  | "past_due"
  | "unpaid"
  | "cancelled"
  | "expired";

export interface LemonSubscriptionAttributes {
  status: LemonSubscriptionStatus | string;
  user_email: string;
  customer_id: number;
}

export function isLemonSqueezyCheckoutConfigured(): boolean {
  return Boolean(
    process.env.LEMONSQUEEZY_API_KEY &&
      process.env.LEMONSQUEEZY_STORE_ID &&
      process.env.LEMONSQUEEZY_VARIANT_ID
  );
}

export function isLemonSqueezyWebhookConfigured(): boolean {
  return Boolean(
    process.env.LEMONSQUEEZY_API_KEY &&
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  );
}

export function isLemonSqueezyConfigured(): boolean {
  return (
    isLemonSqueezyCheckoutConfigured() && isLemonSqueezyWebhookConfigured()
  );
}

export function ensureLemonSqueezySetup(): void {
  if (initialized) return;

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error("LEMONSQUEEZY_API_KEY is not set in environment variables");
  }

  lemonSqueezySetup({
    apiKey,
    onError: (error) => console.error("Lemon Squeezy API error:", error),
  });
  initialized = true;
}

export function getStoreId(): string {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) {
    throw new Error("LEMONSQUEEZY_STORE_ID is not set in environment variables");
  }
  return storeId;
}

export function getVariantId(): string {
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
  if (!variantId) {
    throw new Error(
      "LEMONSQUEEZY_VARIANT_ID is not set in environment variables"
    );
  }
  return variantId;
}

export function getWebhookSecret(): string {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "LEMONSQUEEZY_WEBHOOK_SECRET is not set in environment variables"
    );
  }
  return secret;
}

export function getAppUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
}

const PRO_STATUSES = new Set([
  "active",
  "on_trial",
  "cancelled",
  "past_due",
]);

export function mapSubscriptionToUserUpdate(
  attributes: LemonSubscriptionAttributes,
  subscriptionId: string
) {
  const hasPro = PRO_STATUSES.has(attributes.status);

  return {
    lemonSqueezyCustomerId: String(attributes.customer_id),
    lemonSqueezySubscriptionId: subscriptionId,
    isPaid: hasPro,
    plan: hasPro ? ("pro" as const) : ("free" as const),
    subscriptionType: "lemon_squeezy",
  };
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader) return false;

  const digest = Buffer.from(
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex"),
    "utf8"
  );
  const signature = Buffer.from(signatureHeader, "utf8");

  if (digest.length !== signature.length) return false;
  return crypto.timingSafeEqual(digest, signature);
}

export { createCheckout, getSubscription };
