import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { signJwt } from "@/lib/jwt";
import { comparePassword } from "@/lib/password";

/**
 * @swagger
 * /api/mobile-login:
 *   post:
 *     summary: Authenticate user for mobile app
 *     description: Authenticate a user with email and password for mobile app access
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "SecurePassword123"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: "688250e72a4d1976843ee892"
 *                 email: "user@example.com"
 *                 name: "John Doe"
 *                 plan: "pro"
 *                 isPaid: false
 *                 trialEnd: "2025-09-26T08:55:44.965Z"
 *       400:
 *         description: Bad request - missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Email and password are required"
 *       401:
 *         description: Invalid credentials or account not set up for mobile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_credentials:
 *                 summary: Invalid email or password
 *                 value:
 *                   error: "Invalid email or password"
 *               not_mobile_ready:
 *                 summary: Account not set up for mobile login
 *                 value:
 *                   error: "Account not set up for mobile login. Please use web login."
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

/**
 * @swagger
 * /api/mobile-login:
 *   get:
 *     summary: Health check for mobile login endpoint
 *     description: Check if the mobile login API is running
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mobile login API is running"
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     POST:
 *                       type: string
 *                       example: "Authenticate with email and password"
 *                     GET:
 *                       type: string
 *                       example: "Health check"
 */
export async function GET() {
  return NextResponse.json({ 
    message: "Mobile login API is running",
    endpoints: {
      POST: "Authenticate with email and password",
      GET: "Health check"
    }
  });
}
