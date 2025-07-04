import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth/auth.config";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  "mackewinsson@gmail.com", // Your email
  // Add more admin emails here
];

// Helper function to check if user is authorized
async function isAuthorized(request: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return false;
  }
  return AUTHORIZED_ADMINS.includes(session.user.email);
}

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authorized = await isAuthorized(request);
    if (!authorized) {
      return NextResponse.json(
        {
          error:
            "Access denied. You are not authorized to perform this action.",
        },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await request.json();
    const { email, action, subscriptionType } = body;

    if (!email || !action) {
      return NextResponse.json(
        { error: "Email and action are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    switch (action) {
      case "activate_paid":
        // Activate paid subscription manually
        await User.findOneAndUpdate(
          { email },
          {
            isPaid: true,
            trialStart: new Date(),
            trialEnd: null, // No trial end for paid users
            subscriptionType: subscriptionType || "manual_paid",
          }
        );
        return NextResponse.json({
          success: true,
          message: "User subscription activated",
        });

      case "activate_trial":
        // Activate trial subscription
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 30); // 30-day trial

        await User.findOneAndUpdate(
          { email },
          {
            isPaid: false,
            trialStart: new Date(),
            trialEnd: trialEnd,
            subscriptionType: "manual_trial",
          }
        );
        return NextResponse.json({
          success: true,
          message: "User trial activated",
        });

      case "deactivate":
        // Deactivate subscription
        await User.findOneAndUpdate(
          { email },
          {
            isPaid: false,
            trialStart: null,
            trialEnd: null,
            subscriptionType: null,
          }
        );
        return NextResponse.json({
          success: true,
          message: "User subscription deactivated",
        });

      case "extend_trial":
        // Extend trial by specified days
        const { days = 30 } = body;
        const newTrialEnd = new Date();
        newTrialEnd.setDate(newTrialEnd.getDate() + days);

        await User.findOneAndUpdate(
          { email },
          {
            isPaid: false,
            trialEnd: newTrialEnd,
            subscriptionType: "manual_trial_extended",
          }
        );
        return NextResponse.json({
          success: true,
          message: `Trial extended by ${days} days`,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error managing manual subscription:", error);
    return NextResponse.json(
      { error: "Failed to manage subscription" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    const authorized = await isAuthorized(request);
    if (!authorized) {
      return NextResponse.json(
        {
          error:
            "Access denied. You are not authorized to perform this action.",
        },
        { status: 403 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select("-__v");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: user.email,
      isPaid: user.isPaid || false,
      trialStart: user.trialStart,
      trialEnd: user.trialEnd,
      subscriptionType: user.subscriptionType,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
    });
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch user subscription" },
      { status: 500 }
    );
  }
}
