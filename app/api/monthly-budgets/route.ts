import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import MonthlyBudget from "@/models/MonthlyBudget";
import { getServerSession } from "next-auth";

/**
 * @swagger
 * /api/monthly-budgets:
 *   get:
 *     summary: Get monthly budgets
 *     description: Retrieve monthly budgets for a specific user or all budgets (admin)
 *     tags: [Monthly Budgets]
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: User ID to filter monthly budgets
 *         example: "688250e72a4d1976843ee892"
 *     responses:
 *       200:
 *         description: List of monthly budgets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "688250e72a4d1976843ee893"
 *                   user:
 *                     type: string
 *                     example: "688250e72a4d1976843ee892"
 *                   month:
 *                     type: string
 *                     example: "2024-01"
 *                   totalBudget:
 *                     type: number
 *                     example: 5000
 *                   totalSpent:
 *                     type: number
 *                     example: 3200
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    if (userId) {
      // Get monthly budgets for specific user
      const monthlyBudgets = await MonthlyBudget.find({ user: userId }).sort({
        createdAt: -1,
      });
      return NextResponse.json(monthlyBudgets);
    } else {
      // Get all monthly budgets (for admin purposes)
      const monthlyBudgets = await MonthlyBudget.find({}).sort({
        createdAt: -1,
      });
      return NextResponse.json(monthlyBudgets);
    }
  } catch (error) {
    console.error("Error fetching monthly budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly budgets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      month,
      year,
      categories,
      totalBudgeted,
      totalSpent,
      expensesCount,
    } = body;

    // Get the user ID
    const userRes = await fetch(
      `${request.nextUrl.origin}/api/users?email=${encodeURIComponent(
        session.user.email
      )}`
    );
    if (!userRes.ok) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const users = await userRes.json();
    const userId = users[0]?._id;

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clamp category budgets to >= 0
    const catArray: any[] = categories || [];
    const safeCategories = catArray.map((cat) => ({
      ...cat,
      budgeted: Math.max(0, cat.budgeted),
    }));
    // Clamp totalBudgeted to >= 0
    const safeTotalBudgeted = Math.max(0, totalBudgeted);

    const monthlyBudget = new MonthlyBudget({
      user: userId,
      name,
      month,
      year,
      categories: safeCategories,
      totalBudgeted: safeTotalBudgeted,
      totalSpent,
      expensesCount,
    });

    const savedMonthlyBudget = await monthlyBudget.save();
    return NextResponse.json(savedMonthlyBudget, { status: 201 });
  } catch (error) {
    console.error("Error creating monthly budget:", error);
    return NextResponse.json(
      { error: "Failed to create monthly budget" },
      { status: 500 }
    );
  }
}
