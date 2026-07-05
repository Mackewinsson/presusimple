import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword, validatePassword } from "@/lib/password";
import { verifyPasswordResetToken } from "@/lib/email";

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset password using a valid reset token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: "Password validation failed", details: passwordValidation.errors },
        { status: 400 }
      );
    }

    await dbConnect();

    const users = await User.find({
      passwordResetExpiry: { $gt: new Date() },
      passwordResetToken: { $exists: true, $ne: null },
    });

    let matchedUser = null;
    for (const user of users) {
      if (
        user.passwordResetToken &&
        (await verifyPasswordResetToken(token, user.passwordResetToken))
      ) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    matchedUser.password = await hashPassword(password);
    matchedUser.passwordResetToken = undefined;
    matchedUser.passwordResetExpiry = undefined;
    await matchedUser.save({ validateBeforeSave: true });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("[reset-password] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
