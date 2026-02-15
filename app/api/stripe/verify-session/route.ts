import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

/**
 * GET /api/stripe/verify-session?session_id=xxx
 * Verifies a Stripe Checkout session (e.g. after redirect from checkout).
 * Returns session status for the client to show confirmation or refresh subscription data.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    return NextResponse.json({
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      subscription_id: session.subscription,
      status: session.status,
    });
  } catch (err) {
    console.error("Stripe verify-session error:", err);
    return NextResponse.json(
      { error: "Invalid or expired session" },
      { status: 400 }
    );
  }
}
