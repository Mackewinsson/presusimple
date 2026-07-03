import { NextRequest, NextResponse } from "next/server";
import {
  createCheckout,
  ensureLemonSqueezySetup,
  getAppUrl,
  getStoreId,
  getVariantId,
  isLemonSqueezyConfigured,
} from "@/lib/lemonsqueezy";

/**
 * @swagger
 * /api/lemonsqueezy/checkout:
 *   post:
 *     summary: Create Lemon Squeezy checkout
 *     description: Create a Lemon Squeezy checkout for Pro subscription upgrade
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
 *         description: Checkout created successfully
 *       400:
 *         description: Bad request - missing email
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const { email, locale } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (!isLemonSqueezyConfigured()) {
      return NextResponse.json(
        { error: "Payments are not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    ensureLemonSqueezySetup();

    const prefix = locale === "es" ? "/es" : "";
    const appUrl = getAppUrl();

    const checkout = await createCheckout(getStoreId(), getVariantId(), {
      checkoutData: {
        email,
        custom: {
          user_email: email,
        },
      },
      checkoutOptions: {
        skipTrial: true,
      },
      productOptions: {
        redirectUrl: `${appUrl}${prefix}/budget?checkout=success`,
      },
    });

    const url = checkout.data?.data.attributes.url;
    if (!url) {
      throw new Error(checkout.error?.message || "No checkout URL returned");
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Lemon Squeezy checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
