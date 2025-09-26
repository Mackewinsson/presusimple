import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia", // Use latest stable API version
  maxNetworkRetries: 3, // Retry failed requests up to 3 times
  timeout: 10000, // 10 second timeout
});

// Helper function to get webhook secret
export function getWebhookSecret(): string {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
}

// Helper function to get price ID
export function getPriceId(): string {
  if (!process.env.STRIPE_PRICE_ID) {
    throw new Error("STRIPE_PRICE_ID is not set in environment variables");
  }
  return process.env.STRIPE_PRICE_ID;
}
