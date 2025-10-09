import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { requireAuth } from "@/lib/auth-middleware";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

/**
 * @swagger
 * /api/users/currency:
 *   get:
 *     summary: Get user's currency preference
 *     description: Retrieve the user's preferred currency setting
 *     tags: [Users]
 *     security:
 *       - NextAuth: []
 *     responses:
 *       200:
 *         description: User currency preference retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currency:
 *                   type: string
 *                   example: "USD"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
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
 *   put:
 *     summary: Update user's currency preference
 *     description: Update the user's preferred currency setting
 *     tags: [Users]
 *     security:
 *       - NextAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currency]
 *             properties:
 *               currency:
 *                 type: string
 *                 description: Currency code (e.g., USD, EUR, GBP)
 *                 example: "USD"
 *     responses:
 *       200:
 *         description: Currency preference updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Currency preference updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - missing currency
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Currency is required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
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
// GET /api/users/currency - Get user's currency preference
export async function GET(request: NextRequest) {
  try {
    let userEmail: string | null = null;

    // Check for JWT token (mobile app)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const authResult = requireAuth(request);
      if ("error" in authResult) {
        return authResult.error;
      }
      userEmail = authResult.user.email;
    } else {
      // Check for NextAuth session (web app)
      const session = await getServerSession();
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userEmail = session.user.email;
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userDoc = await User.findOne({ email: userEmail });
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ currency: userDoc.currency || "USD" });
  } catch (error) {
    console.error("Error getting user currency:", error);
    return NextResponse.json(
      { error: "Failed to get user currency" },
      { status: 500 }
    );
  }
}

// PUT /api/users/currency - Update user's currency preference
export async function PUT(request: NextRequest) {
  try {
    let userEmail: string | null = null;

    // Check for JWT token (mobile app)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const authResult = requireAuth(request);
      if ("error" in authResult) {
        return authResult.error;
      }
      userEmail = authResult.user.email;
    } else {
      // Check for NextAuth session (web app)
      const session = await getServerSession();
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userEmail = session.user.email;
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currency } = body;

    if (!currency) {
      return NextResponse.json(
        { error: "Currency is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { currency },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ currency: updatedUser.currency });
  } catch (error) {
    console.error("Error updating user currency:", error);
    return NextResponse.json(
      { error: "Failed to update user currency" },
      { status: 500 }
    );
  }
} 