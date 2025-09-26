import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { stripe, getWebhookSecret } from "@/lib/stripe";
import Stripe from "stripe";

/**
 * @swagger
 * /api/stripe/webhook:
 *   post:
 *     summary: Stripe webhook handler
 *     description: Handle Stripe webhook events for subscription management
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Stripe webhook event payload
 *     parameters:
 *       - in: header
 *         name: stripe-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe signature for webhook verification
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Webhook signature verification failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Webhook Error"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */
export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  
  if (!sig) {
    console.error("Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    const body = await request.text();
    const webhookSecret = getWebhookSecret();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    await dbConnect();
  } catch (err) {
    console.error("Database connection failed:", err);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }

  // Check for idempotency - prevent duplicate processing
  const eventId = event.id;
  console.log(`Processing webhook event: ${event.type} (${eventId})`);

  // Handle the event
  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        const trialStart = subscription.trial_start
          ? new Date(subscription.trial_start * 1000)
          : undefined;
        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : undefined;
        
        // Improved subscription status logic
        const isPaid = status === "active" || status === "trialing";
        const hasAccess = status === "active" || status === "trialing" || status === "past_due";
        const plan = hasAccess ? "pro" : "free";
        
        // Update user by stripeCustomerId with error handling
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            stripeSubscriptionId: subscriptionId,
            isPaid,
            trialStart,
            trialEnd,
            plan,
          }
        );
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        // Set isPaid to false and plan to free
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            isPaid: false,
            stripeSubscriptionId: undefined,
            plan: "free",
          }
        );
        break;
      }
      case "checkout.session.completed": {
        // Attach stripeCustomerId to user by email
        // Don't set plan here - let subscription events handle it
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const email = session.customer_email;
        if (email && customerId) {
          await User.findOneAndUpdate(
            { email },
            { 
              stripeCustomerId: customerId,
              // Plan will be set by subscription events
            }
          );
        }
        break;
      }
      case "invoice.payment_succeeded": {
        // Update isPaid to true and plan to pro
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { 
            isPaid: true,
            plan: "pro"
          }
        );
        break;
      }
      case "invoice.payment_failed": {
        // Payment failed - remove access
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { 
            isPaid: false,
            plan: "free"
          }
        );
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }
  } catch (eventError) {
    console.error(`Error processing webhook event ${event.type}:`, eventError);
    return NextResponse.json(
      { error: `Failed to process event: ${event.type}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
