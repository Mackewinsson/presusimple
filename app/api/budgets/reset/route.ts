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

    console.log("=== RESET DEBUG START ===");
    console.log("User ID:", userId);

    // Get the current budget for the user
    const budget = await Budget.findOne({ user: userId });
    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    console.log("=== BEFORE RESET ===");
    console.log("Budget before reset:", {
      _id: budget._id,
      totalBudgeted: budget.totalBudgeted,
      totalAvailable: budget.totalAvailable,
      sections: budget.sections
    });

    // Get all categories for this budget (using sectionIds)
    const sectionIds = budget.sections.map(
      (section: any) => section._id || section.name
    );
    const categories = await Category.find({
      sectionId: { $in: sectionIds },
    });
    console.log("Categories before reset:", categories.map(c => ({
      name: c.name,
      budgeted: c.budgeted,
      spent: c.spent,
      sectionId: c.sectionId
    })));

    // Get all expenses for this user
    const expenses = await Expense.find({ user: userId });
    console.log("Expenses before reset:", expenses.length);

    // Calculate total spent from expenses
    const totalSpent = expenses.reduce((sum, expense) => {
      return (
        sum + (expense.type === "expense" ? expense.amount : -expense.amount)
      );
    }, 0);
    console.log("Total spent calculated:", totalSpent);

    // Reset all categories (set spent to 0, keep budgeted amounts)
    await Category.updateMany(
      { sectionId: { $in: sectionIds } },
      { $set: { spent: 0 } }
    );
    console.log("Categories reset (spent set to 0)");

    // Delete all expenses for this user
    await Expense.deleteMany({ user: userId });
    console.log("All expenses deleted");

    // Calculate total budgeted from categories (to keep allocations)
    const totalBudgetedFromCategories = categories.reduce(
      (sum, cat) => sum + cat.budgeted,
      0
    );
    console.log("Total budgeted from categories:", totalBudgetedFromCategories);

    // Update budget totals - ensure totalBudgeted matches the sum of category budgets
    // The total budget amount should remain the same, just ensure proper synchronization
    const totalBudgetAmount = budget.totalBudgeted + budget.totalAvailable;
    console.log("Total budget amount (budgeted + available):", totalBudgetAmount);
    
    const newTotalBudgeted = totalBudgetedFromCategories;
    const newTotalAvailable = totalBudgetAmount - totalBudgetedFromCategories;
    
    console.log("New values to set:", {
      totalBudgeted: newTotalBudgeted,
      totalAvailable: newTotalAvailable
    });

    const updateResult = await Budget.findByIdAndUpdate(budget._id, {
      totalBudgeted: newTotalBudgeted,
      totalAvailable: newTotalAvailable,
    }, { new: true });

    console.log("Budget update result:", {
      _id: updateResult._id,
      totalBudgeted: updateResult.totalBudgeted,
      totalAvailable: updateResult.totalAvailable
    });

    // Get the updated budget to return the correct totals
    const updatedBudget = await Budget.findById(budget._id);
    console.log("=== AFTER RESET ===");
    console.log("Updated budget:", {
      _id: updatedBudget._id,
      totalBudgeted: updatedBudget.totalBudgeted,
      totalAvailable: updatedBudget.totalAvailable
    });

    // Double-check if the update actually worked
    if (updatedBudget.totalBudgeted !== newTotalBudgeted || updatedBudget.totalAvailable !== newTotalAvailable) {
      console.log("WARNING: Budget update did not work as expected!");
      console.log("Expected:", { totalBudgeted: newTotalBudgeted, totalAvailable: newTotalAvailable });
      console.log("Actual:", { totalBudgeted: updatedBudget.totalBudgeted, totalAvailable: updatedBudget.totalAvailable });
    } else {
      console.log("SUCCESS: Budget update worked correctly!");
    }

    // Verify categories are still correct
    const categoriesAfter = await Category.find({
      sectionId: { $in: sectionIds },
    });
    console.log("Categories after reset:", categoriesAfter.map(c => ({
      name: c.name,
      budgeted: c.budgeted,
      spent: c.spent
    })));

    console.log("=== RESET DEBUG END ===");

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
