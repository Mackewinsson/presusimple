import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword, validatePassword } from "@/lib/password";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * @swagger
 * /api/mobile-setup-password:
 *   post:
 *     summary: Set password for mobile login
 *     description: Allow Google OAuth users to set a password for mobile app access
 *     tags: [Authentication]
 *     security:
 *       - NextAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordSetupRequest'
 *           example:
 *             password: "SecurePassword123"
 *     responses:
 *       200:
 *         description: Password set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password set successfully. You can now use mobile login."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               message: "Password set successfully. You can now use mobile login."
 *               user:
 *                 id: "688250e72a4d1976843ee892"
 *                 email: "user@example.com"
 *                 name: "John Doe"
 *                 plan: "pro"
 *                 isPaid: false
 *                 trialEnd: "2025-09-26T08:55:44.965Z"
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missing_password:
 *                 summary: Missing password
 *                 value:
 *                   error: "Password is required"
 *               password_validation:
 *                 summary: Password validation failed
 *                 value:
 *                   error: "Password validation failed"
 *                   details: ["Password must be at least 8 characters long"]
 *       401:
 *         description: Not authenticated via web session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Not authenticated via web session"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */
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

/**
 * @swagger
 * /api/mobile-setup-password:
 *   get:
 *     summary: Check password setup status
 *     description: Check if a user can set up a password for mobile login
 *     tags: [Authentication]
 *     security:
 *       - NextAuth: []
 *     responses:
 *       200:
 *         description: Password setup status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 canSetupPassword:
 *                   type: boolean
 *                   description: Whether the user can set up a password
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               canSetupPassword: true
 *               user:
 *                 id: "688250e72a4d1976843ee892"
 *                 email: "user@example.com"
 *                 name: "John Doe"
 *                 plan: "pro"
 *                 isPaid: false
 *                 trialEnd: "2025-09-26T08:55:44.965Z"
 *       401:
 *         description: Not authenticated via web session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Authentication required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */
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
