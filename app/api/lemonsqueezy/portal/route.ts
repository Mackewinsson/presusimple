import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import {
  ensureLemonSqueezySetup,
  getSubscription,
  isLemonSqueezyConfigured,
} from "@/lib/lemonsqueezy";

/**
 * POST /api/lemonsqueezy/portal
 * Returns a signed Lemon Squeezy customer portal URL for subscription management.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (!isLemonSqueezyConfigured()) {
      return NextResponse.json(
        { error: "Payments are not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    await dbConnect();

    const user = (await User.findOne({ email })
      .select("lemonSqueezySubscriptionId")
      .lean()) as { lemonSqueezySubscriptionId?: string } | null;

    if (!user?.lemonSqueezySubscriptionId) {
      return NextResponse.json(
        { error: "No billing account found. Complete checkout first." },
        { status: 400 }
      );
    }

    ensureLemonSqueezySetup();

    const subscription = await getSubscription(user.lemonSqueezySubscriptionId);
    const portalUrl = subscription.data?.data.attributes.urls.customer_portal;

    if (!portalUrl) {
      return NextResponse.json(
        { error: "Failed to create portal session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: portalUrl });
  } catch (err) {
    console.error("Lemon Squeezy portal error:", err);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
