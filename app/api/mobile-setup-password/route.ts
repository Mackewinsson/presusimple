import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword, validatePassword } from "@/lib/password";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/mobile-setup-password - Set up password for existing Google OAuth users
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated via NextAuth (Google OAuth)
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required. Please log in first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
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

    // Find user by email from session
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already has a password set
    if (user.password) {
      return NextResponse.json(
        { error: "Password already set for this account" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Update user with password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      message: "Password set successfully. You can now use mobile login.",
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
    console.error("Mobile password setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/mobile-setup-password - Check if user can set up password
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      canSetupPassword: !user.password,
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
    console.error("Mobile password setup check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
