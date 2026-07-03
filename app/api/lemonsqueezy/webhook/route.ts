import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import WebhookEvent from "@/models/WebhookEvent";
import {
  ensureLemonSqueezySetup,
  getSubscription,
  getWebhookSecret,
  isLemonSqueezyWebhookConfigured,
  mapSubscriptionToUserUpdate,
  verifyWebhookSignature,
  type LemonSubscriptionAttributes,
} from "@/lib/lemonsqueezy";

interface LemonWebhookPayload {
  meta?: {
    event_name?: string;
  };
  data?: {
    type?: string;
    id?: string;
    attributes?: LemonSubscriptionAttributes & {
      subscription_id?: number;
      user_email?: string;
    };
  };
}

const SUBSCRIPTION_EVENTS = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_expired",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_paused",
  "subscription_unpaused",
]);

const PAYMENT_EVENTS = new Set([
  "subscription_payment_success",
  "subscription_payment_failed",
  "subscription_payment_recovered",
]);

async function syncUserFromSubscription(
  subscriptionId: string,
  attributes: LemonSubscriptionAttributes
) {
  const update = mapSubscriptionToUserUpdate(attributes, subscriptionId);

  await User.findOneAndUpdate({ email: attributes.user_email }, update);
}

async function syncUserFromSubscriptionId(subscriptionId: string) {
  ensureLemonSqueezySetup();
  const subscription = await getSubscription(subscriptionId);
  const data = subscription.data?.data;

  if (!data?.attributes?.user_email) {
    throw new Error(`Subscription ${subscriptionId} missing user_email`);
  }

  await syncUserFromSubscription(data.id, data.attributes);
}

/**
 * @swagger
 * /api/lemonsqueezy/webhook:
 *   post:
 *     summary: Lemon Squeezy webhook handler
 *     description: Handle Lemon Squeezy webhook events for subscription management
 *     tags: [Payments]
 */
export async function POST(request: NextRequest) {
  if (!isLemonSqueezyWebhookConfigured()) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("X-Signature");

  try {
    const secret = getWebhookSecret();
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Webhook verification setup failed:", err);
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 500 });
  }

  let payload: LemonWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventName = payload.meta?.event_name;
  const data = payload.data;

  if (!eventName || !data?.id) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const eventId = `${eventName}:${data.id}`;

  try {
    await dbConnect();
  } catch (err) {
    console.error("Database connection failed:", err);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }

  const existing = await WebhookEvent.findOne({ eventId }).lean();
  if (existing) {
    return NextResponse.json({ received: true });
  }

  try {
    if (data.type === "subscriptions" && SUBSCRIPTION_EVENTS.has(eventName)) {
      await syncUserFromSubscription(data.id, data.attributes!);
    } else if (PAYMENT_EVENTS.has(eventName)) {
      if (data.type === "subscriptions") {
        await syncUserFromSubscription(data.id, data.attributes!);
      } else if (data.attributes?.subscription_id) {
        await syncUserFromSubscriptionId(String(data.attributes.subscription_id));
      } else if (data.attributes?.user_email && eventName === "subscription_payment_success") {
        await User.findOneAndUpdate(
          { email: data.attributes.user_email },
          { isPaid: true, plan: "pro", subscriptionType: "lemon_squeezy" }
        );
      }
    }

    await WebhookEvent.create({ eventId, processedAt: new Date() });
  } catch (eventError) {
    console.error(`Error processing webhook event ${eventName}:`, eventError);
    return NextResponse.json(
      { error: `Failed to process event: ${eventName}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
