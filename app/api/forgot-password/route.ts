import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import {
  generatePasswordResetToken,
  getAppUrl,
  getPasswordResetExpiry,
  hashPasswordResetToken,
  sendPasswordResetEmail,
} from "@/lib/email";

const GENERIC_SUCCESS_MESSAGE =
  "If an account exists with that email, you will receive a password reset link shortly.";

/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent if account exists
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (user) {
      const token = generatePasswordResetToken();
      const hashedToken = await hashPasswordResetToken(token);

      user.passwordResetToken = hashedToken;
      user.passwordResetExpiry = getPasswordResetExpiry();
      await user.save();

      const resetUrl = `${getAppUrl()}/auth/reset-password?token=${token}`;
      const result = await sendPasswordResetEmail(user.email, resetUrl);

      if (!result.success && !result.skipped) {
        console.error("[forgot-password] Failed to send email:", result.error);
      }
    }

    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
  } catch (error) {
    console.error("[forgot-password] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
