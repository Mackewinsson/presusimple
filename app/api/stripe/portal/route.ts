import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe/portal
 * Creates a Stripe Billing Portal session so the customer can manage subscription, payment method, cancel, etc.
 * Body: { email: string }
 * Returns: { url: string } to redirect the user to the portal.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, locale } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Missing email" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = (await User.findOne({ email }).select("stripeCustomerId").lean()) as { stripeCustomerId?: string } | null;
    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Complete checkout first." },
        { status: 400 }
      );
    }

    const prefix = locale === "es" ? "/es" : "";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const appUrl = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
    const returnUrl = `${appUrl}${prefix}/budget/settings`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
