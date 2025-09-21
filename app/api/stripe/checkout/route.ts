import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * @swagger
 * /api/stripe/checkout:
 *   post:
 *     summary: Create Stripe checkout session
 *     description: Create a Stripe checkout session for subscription with 30-day trial
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Customer email address
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: Stripe checkout session ID
 *                   example: "cs_test_1234567890"
 *                 url:
 *                   type: string
 *                   description: Checkout URL
 *                   example: "https://checkout.stripe.com/pay/cs_test_1234567890"
 *       400:
 *         description: Bad request - missing email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Missing email"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to create checkout session"
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Get the base URL with proper scheme
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const appUrl = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;

    // Create a Stripe Checkout Session for a subscription with a 30-day trial
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
      },
      success_url: `${appUrl}/budget?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/budget`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
