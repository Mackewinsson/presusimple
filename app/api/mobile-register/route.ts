import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword, validatePassword } from "@/lib/password";

/**
 * @swagger
 * /api/mobile-register:
 *   post:
 *     summary: Register new user for mobile app
 *     description: Create a new user account with email and password for mobile app access
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: "newuser@example.com"
 *             password: "SecurePassword123"
 *             name: "John Doe"
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               message: "User created successfully"
 *               user:
 *                 id: "688250e72a4d1976843ee892"
 *                 email: "newuser@example.com"
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
 *               missing_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   error: "Email and password are required"
 *               password_validation:
 *                 summary: Password validation failed
 *                 value:
 *                   error: "Password validation failed"
 *                   details: ["Password must be at least 8 characters long", "Password must contain at least one uppercase letter"]
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User with this email already exists"
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

/**
 * @swagger
 * /api/mobile-register:
 *   get:
 *     summary: Health check for mobile register endpoint
 *     description: Check if the mobile register API is running
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
 *                   example: "Mobile registration API is running"
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     POST:
 *                       type: string
 *                       example: "Register new user with email and password"
 *                     GET:
 *                       type: string
 *                       example: "Health check"
 */
export async function GET() {
  return NextResponse.json({ 
    message: "Mobile registration API is running",
    endpoints: {
      POST: "Register new user with email and password",
      GET: "Health check"
    }
  });
}

