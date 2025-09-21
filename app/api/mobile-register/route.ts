import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword, validatePassword } from "@/lib/password";

// POST /api/mobile-register - Register new user with email and password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: "Password validation failed", details: passwordValidation.errors },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user with trial activation
    const trialEnd = new Date();
    trialEnd.setTime(trialEnd.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    
    const user = new User({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0], // Use email prefix as name if not provided
      isPaid: false,
      plan: "pro", // Trial users get pro features
      trialStart: new Date(),
      trialEnd: trialEnd,
      subscriptionType: "mobile_signup",
    });
    
    await user.save();

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        plan: user.plan,
        isPaid: user.isPaid,
        trialEnd: user.trialEnd,
      },
    });

  } catch (error) {
    console.error("Mobile registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/mobile-register - Health check
export async function GET() {
  return NextResponse.json({ 
    message: "Mobile registration API is running",
    endpoints: {
      POST: "Register new user with email and password",
      GET: "Health check"
    }
  });
}

