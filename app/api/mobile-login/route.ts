import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { signJwt } from "@/lib/jwt";
import { comparePassword } from "@/lib/password";

// POST /api/mobile-login - Authenticate with email and password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user has a password (mobile users)
    if (!user.password) {
      return NextResponse.json(
        { error: "Account not set up for mobile login. Please use web login." },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = signJwt({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      token,
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
    console.error("Mobile login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/mobile-login - Health check
export async function GET() {
  return NextResponse.json({ 
    message: "Mobile login API is running",
    endpoints: {
      POST: "Authenticate with email and password",
      GET: "Health check"
    }
  });
}
