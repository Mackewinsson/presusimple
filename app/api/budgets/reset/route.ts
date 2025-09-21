import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import Category from "@/models/Category";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth";
import NextAuth from "next-auth";

/**
 * @swagger
 * /api/budgets/reset:
 *   post:
 *     summary: Reset user's budget data
 *     description: Reset all budget data for a user (budgets, categories, expenses)
 *     tags: [Budgets]
 *     security:
 *       - NextAuth: []
 *     responses:
 *       200:
 *         description: Budget data reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Budget data reset successfully"
 *                 deletedCounts:
 *                   type: object
 *                   properties:
 *                     budgets:
 *                       type: number
 *                       example: 2
 *                     categories:
 *                       type: number
 *                       example: 15
 *                     expenses:
 *                       type: number
 *                       example: 45
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
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
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

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

    // Get the current budget for the user
    const budget = await Budget.findOne({ user: userId });
    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Get all categories for this budget
    const categories = await Category.find({
      budgetId: budget._id,
    });

    // Get all expenses for this user
    const expenses = await Expense.find({ user: userId });

    // Calculate total spent from expenses
    const totalSpent = expenses.reduce((sum, expense) => {
      return (
        sum + (expense.type === "expense" ? expense.amount : -expense.amount)
      );
    }, 0);

    // Reset all categories (set spent to 0, keep budgeted amounts)
    await Category.updateMany(
      { budgetId: budget._id },
      { $set: { spent: 0 } }
    );

    // Delete all expenses for this user
    await Expense.deleteMany({ user: userId });

    // Calculate total budgeted from categories (to keep allocations)
    const totalBudgetedFromCategories = categories.reduce(
      (sum, cat) => sum + cat.budgeted,
      0
    );

    // Update budget totals - ensure totalBudgeted matches the sum of category budgets
    // The total budget amount should remain the same, just ensure proper synchronization
    const totalBudgetAmount = budget.totalBudgeted + budget.totalAvailable;
    
    const newTotalBudgeted = totalBudgetedFromCategories;
    const newTotalAvailable = totalBudgetAmount - totalBudgetedFromCategories;

    const updateResult = await Budget.findByIdAndUpdate(budget._id, {
      totalBudgeted: newTotalBudgeted,
      totalAvailable: newTotalAvailable,
    }, { new: true });

    // Get the updated budget to return the correct totals
    const updatedBudget = await Budget.findById(budget._id);

    return NextResponse.json({
      message: "Budget reset successfully",
      savedData: {
        month: budget.month,
        year: budget.year,
        categories: categories.map((cat) => ({
          name: cat.name,
          budgeted: cat.budgeted,
          spent: cat.spent,
        })),
        totalBudgeted:
          updatedBudget?.totalBudgeted || totalBudgetedFromCategories,
        totalSpent: totalSpent,
        expensesCount: expenses.length,
      },
    });
  } catch (error) {
    console.error("Error resetting budget:", error);
    return NextResponse.json(
      { error: "Failed to reset budget" },
      { status: 500 }
    );
  }
}
