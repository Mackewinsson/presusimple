import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import Category from "@/models/Category";

export async function GET() {
  try {
    const authResult = await requireAdminApi();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await dbConnect();

    // Find budgets with collaborators
    const sharedBudgets = await Budget.find({
      "collaborators.0": { $exists: true },
    })
      .populate("user", "email name")
      .select("user month year totalBudgeted totalAvailable collaborators createdAt");

    // Find categories with collaborators
    const sharedCategories = await Category.find({
      "collaborators.0": { $exists: true },
    }).select("name budgeted spent budgetId collaborators createdAt");

    return NextResponse.json({
      totalSharedBudgets: sharedBudgets.length,
      totalSharedCategories: sharedCategories.length,
      sharedBudgets,
      sharedCategories,
    });
  } catch (error) {
    console.error("Error fetching admin shared budgets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await requireAdminApi();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { budgetId, categoryId, collaboratorEmail } = await request.json();
    if (!collaboratorEmail || (!budgetId && !categoryId)) {
      return NextResponse.json({ error: "collaboratorEmail and budgetId or categoryId are required" }, { status: 400 });
    }

    await dbConnect();

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      if (category.collaborators) {
        category.collaborators = category.collaborators.filter(
          (c: any) => c.email.toLowerCase() !== collaboratorEmail.toLowerCase().trim()
        );
        await category.save();
      }
      return NextResponse.json({ message: `Collaborator ${collaboratorEmail} removed from category` });
    }

    if (budgetId) {
      const budget = await Budget.findById(budgetId);
      if (!budget) {
        return NextResponse.json({ error: "Budget not found" }, { status: 404 });
      }
      if (budget.collaborators) {
        budget.collaborators = budget.collaborators.filter(
          (c: any) => c.email.toLowerCase() !== collaboratorEmail.toLowerCase().trim()
        );
        await budget.save();
      }
      return NextResponse.json({ message: `Collaborator ${collaboratorEmail} removed from budget` });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
