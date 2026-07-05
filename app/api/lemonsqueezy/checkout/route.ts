import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createCheckout,
  ensureLemonSqueezySetup,
  getAppUrl,
  getStoreId,
  getVariantId,
  isLemonSqueezyCheckoutConfigured,
} from "@/lib/lemonsqueezy";

/**
 * @swagger
 * /api/lemonsqueezy/checkout:
 *   post:
 *     summary: Create Lemon Squeezy checkout
 *     description: Create a Lemon Squeezy checkout for Pro subscription upgrade
 *     tags: [Payments]
 *     security:
 *       - NextAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locale:
 *                 type: string
 *                 enum: [en, es]
 *                 description: Locale for post-checkout redirect
 *     responses:
 *       200:
 *         description: Checkout created successfully
 *       401:
 *         description: Unauthorized - sign in required
 *       503:
 *         description: Payments not configured
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const locale = body?.locale === "es" ? "es" : "en";

    if (!isLemonSqueezyCheckoutConfigured()) {
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
