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
            plan: "pro", // Set plan to pro for paid users
            trialStart: null, // ✅ Fixed: Don't set trial start for paid users
            trialEnd: null, // No trial end for paid users
            subscriptionType: subscriptionType || "manual_paid",
          }
        );
        return NextResponse.json({
          success: true,
          message: "User subscription activated (Pro plan)",
        });

      case "activate_trial":
        // Activate trial subscription
        const trialEnd = new Date();
        trialEnd.setTime(trialEnd.getTime() + (30 * 24 * 60 * 60 * 1000)); // Exactly 30 days in milliseconds

        await User.findOneAndUpdate(
          { email },
          {
            isPaid: false,
            plan: "pro", // Trial users get pro features
            trialStart: new Date(),
            trialEnd: trialEnd,
            subscriptionType: "manual_trial",
          }
        );
        return NextResponse.json({
          success: true,
          message: "User trial activated (Pro plan)",
        });

      case "deactivate":
        // Deactivate subscription
        await User.findOneAndUpdate(
          { email },
          {
            isPaid: false,
            plan: "free", // Set plan to free when deactivated
            trialStart: null,
            trialEnd: null,
            subscriptionType: null,
          }
        );
        return NextResponse.json({
          success: true,
          message: "User subscription deactivated (Free plan)",
        });

      case "extend_trial":
        // Extend trial by specified days
        const { days = 30 } = body;
        const newTrialEnd = new Date();
        newTrialEnd.setTime(newTrialEnd.getTime() + (days * 24 * 60 * 60 * 1000)); // Exactly specified days in milliseconds

        await User.findOneAndUpdate(
          { email },
          {
            isPaid: false,
            plan: "pro", // Keep pro plan for extended trial
            trialEnd: newTrialEnd,
            subscriptionType: "manual_trial_extended",
          }
        );
        return NextResponse.json({
          success: true,
          message: `Trial extended by ${days} days (Pro plan)`,
        });

      case "set_pro_plan":
        // Set user to pro plan only
        await User.findOneAndUpdate(
          { email },
          {
            plan: "pro",
            subscriptionType: "manual_pro_only",
          }
        );
        return NextResponse.json({
          success: true,
          message: "User set to Pro plan",
        });

      case "set_free_plan":
        // Set user to free plan only
        await User.findOneAndUpdate(
          { email },
          {
            plan: "free",
            isPaid: false,
            trialStart: null,
            trialEnd: null,
            subscriptionType: "manual_free_only",
          }
        );
        return NextResponse.json({
          success: true,
          message: "User set to Free plan",
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
      plan: user.plan || "free",
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
