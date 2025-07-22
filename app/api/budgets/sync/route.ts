import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";

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
    const sectionIds = budget.sections.map(
      (section: any) => section._id || section.name
    );
    const categories = await Category.find({
      sectionId: { $in: sectionIds },
    });

    // Calculate total budgeted from categories
    const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);

    // Update budget totals
    const totalBudgetAmount = budget.totalBudgeted + budget.totalAvailable;
    await Budget.findByIdAndUpdate(budget._id, {
      totalBudgeted: totalBudgeted,
      totalAvailable: totalBudgetAmount - totalBudgeted,
    });

    // Get the updated budget
    const updatedBudget = await Budget.findById(budget._id);

    return NextResponse.json({
      message: "Budget totals synced successfully",
      budget: updatedBudget,
      categories: categories,
      totalBudgeted: totalBudgeted,
    });
  } catch (error) {
    console.error("Error syncing budget totals:", error);
    return NextResponse.json(
      { error: "Failed to sync budget totals" },
      { status: 500 }
    );
  }
} 