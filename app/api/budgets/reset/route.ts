import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import Category from "@/models/Category";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth";
import NextAuth from "next-auth";

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

    // Get all categories for this user
    const categories = await Category.find({ user: userId });

    // Get all expenses for this user
    const expenses = await Expense.find({ user: userId });

    // Calculate total spent from expenses
    const totalSpent = expenses.reduce((sum, expense) => {
      return (
        sum + (expense.type === "expense" ? expense.amount : -expense.amount)
      );
    }, 0);

    // Reset all categories (set spent to 0, keep budgeted amounts)
    await Category.updateMany({ user: userId }, { $set: { spent: 0 } });

    // Delete all expenses for this user
    await Expense.deleteMany({ user: userId });

    // Calculate total budgeted from categories (to keep allocations)
    const totalBudgetedFromCategories = categories.reduce(
      (sum, cat) => sum + cat.budgeted,
      0
    );

    // Update budget totals - keep the total budget amount and category allocations
    const totalBudgetAmount = budget.totalBudgeted + budget.totalAvailable;
    await Budget.findByIdAndUpdate(budget._id, {
      totalBudgeted: totalBudgetedFromCategories, // Keep the sum of category budgets
      totalAvailable: totalBudgetAmount - totalBudgetedFromCategories, // Remaining amount
    });

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
