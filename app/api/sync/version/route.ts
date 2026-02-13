import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import Category from "@/models/Category";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * @swagger
 * /api/sync/version:
 *   get:
 *     summary: Get data version hashes for silent sync
 *     description: Returns version hashes for budget, categories, and expenses to check if data has changed
 *     tags:
 *       - Sync
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get version data for
 *     responses:
 *       200:
 *         description: Version data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 budgetVersion:
 *                   type: string
 *                 categoriesVersion:
 *                   type: string
 *                 expensesVersion:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await dbConnect();

    // Get last updated timestamps for each data type
    const [budget, categoriesResult, expensesResult] = await Promise.all([
      Budget.findOne({ userId }).select("updatedAt").lean() as Promise<{ updatedAt?: Date } | null>,
      Category.find({ userId }).select("updatedAt").sort({ updatedAt: -1 }).limit(1).lean() as Promise<{ updatedAt?: Date }[]>,
      Expense.find({ userId }).select("updatedAt").sort({ updatedAt: -1 }).limit(1).lean() as Promise<{ updatedAt?: Date }[]>,
    ]);

    // Create version strings from timestamps
    const budgetVersion = budget?.updatedAt?.getTime().toString() || "0";
    const categoriesVersion = categoriesResult[0]?.updatedAt?.getTime().toString() || "0";
    const expensesVersion = expensesResult[0]?.updatedAt?.getTime().toString() || "0";

    return NextResponse.json({
      budgetVersion,
      categoriesVersion,
      expensesVersion,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching version data:", error);
    return NextResponse.json(
      { error: "Failed to fetch version data" },
      { status: 500 }
    );
  }
}
