import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  await dbConnect();

  // Handle the event
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
      const isPaid = status === "active" || status === "trialing";
      
      // Set plan to "pro" for active subscriptions, "free" for inactive
      const plan = isPaid ? "pro" : "free";
      
      // Update user by stripeCustomerId
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
      // Attach stripeCustomerId to user by email and set plan to pro
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const email = session.customer_email;
      if (email && customerId) {
        await User.findOneAndUpdate(
          { email },
          { 
            stripeCustomerId: customerId,
            plan: "pro" // New customers get pro plan
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
    default:
      
  }

  return NextResponse.json({ received: true });
}
