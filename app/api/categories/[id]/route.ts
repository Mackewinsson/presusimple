import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Category from "@/models/Category";
import Expense from "@/models/Expense";
import Budget from "@/models/Budget";

// PUT /api/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await dbConnect();
    const body = await request.json();

    const update: { name?: string; budgeted?: number; order?: number } = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.budgeted !== undefined) update.budgeted = body.budgeted;
    if (body.order !== undefined) update.order = body.order;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "At least one field required: name, budgeted, order" },
        { status: 400 }
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Update the budget's totalBudgeted to reflect the updated category
    const budget = await Budget.findById(updatedCategory.budgetId);
    if (budget) {
      // Get all categories for this budget
      const allCategories = await Category.find({
        budgetId: budget._id,
      });
      
      // Calculate total budgeted from all categories
      const totalBudgeted = allCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
      
      // Update budget totals
      const totalBudgetAmount = budget.totalBudgeted + budget.totalAvailable;
      await Budget.findByIdAndUpdate(budget._id, {
        totalBudgeted: totalBudgeted,
        totalAvailable: totalBudgetAmount - totalBudgeted,
      });
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await dbConnect();

    // Get the category before deleting to know its sectionId
    const categoryToDelete = await Category.findById(id);
    if (!categoryToDelete) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Also delete all expenses with this categoryId
    await Expense.deleteMany({ categoryId: id });

    // Update the budget's totalBudgeted to reflect the deleted category
    const budget = await Budget.findById(categoryToDelete.budgetId);
    if (budget) {
      // Get all remaining categories for this budget
      const allCategories = await Category.find({
        budgetId: budget._id,
      });
      
      // Calculate total budgeted from remaining categories
      const totalBudgeted = allCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
      
      // Update budget totals
      const totalBudgetAmount = budget.totalBudgeted + budget.totalAvailable;
      await Budget.findByIdAndUpdate(budget._id, {
        totalBudgeted: totalBudgeted,
        totalAvailable: totalBudgetAmount - totalBudgeted,
      });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
