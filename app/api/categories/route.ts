import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Category from "../../../models/Category";
import Budget from "../../../models/Budget";

// GET /api/categories - Get all categories or filter by user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");
    const budgetId = searchParams.get("budget");

    if (userId) {
      // Get user's budget first
      const budget = await Budget.findOne({ user: userId });
      if (!budget) {
        return NextResponse.json([]);
      }

      // Get section names from the budget
      const sectionNames = budget.sections.map(
        (section: any) => section.name
      );

      // Filter categories by section names
      const categories = await Category.find({
        sectionId: { $in: sectionNames },
      }).sort({ createdAt: -1 });

      return NextResponse.json(categories);
    } else if (budgetId) {
      // Get categories for a specific budget
      const budget = await Budget.findById(budgetId);
      if (!budget) {
        return NextResponse.json([]);
      }

      // Get section names from the budget
      const sectionNames = budget.sections.map(
        (section: any) => section.name
      );

      // Filter categories by section names
      const categories = await Category.find({
        sectionId: { $in: sectionNames },
      }).sort({ createdAt: -1 });

      return NextResponse.json(categories);
    } else {
      // Get all categories (for admin purposes)
      const categories = await Category.find({}).sort({ createdAt: -1 });
      return NextResponse.json(categories);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { name, budgeted, sectionId } = body;

    if (!name || budgeted === undefined || !sectionId) {
      return NextResponse.json(
        { error: "Missing required fields: name, budgeted, sectionId" },
        { status: 400 }
      );
    }

    console.log("=== CATEGORY CREATION DEBUG ===");
    console.log("Creating category:", { name, budgeted, sectionId });

    const category = new Category({
      name,
      budgeted,
      spent: 0,
      sectionId,
    });

    const savedCategory = await category.save();
    console.log("Category saved:", savedCategory);

    // Update the budget's totalBudgeted to reflect the new category
    // First try to find budget by section name
    let budget = await Budget.findOne({ "sections.name": sectionId });
    
    // If not found, try to find budget by section ID (ObjectId)
    if (!budget) {
      budget = await Budget.findOne({ "sections._id": sectionId });
    }
    
    if (budget) {
      console.log("Found budget:", {
        _id: budget._id,
        totalBudgeted: budget.totalBudgeted,
        totalAvailable: budget.totalAvailable
      });

      // Get all categories for this budget
      const sectionNames = budget.sections.map(
        (section: any) => section.name
      );
      const allCategories = await Category.find({
        sectionId: { $in: sectionNames },
      });
      
      console.log("All categories for budget:", allCategories.map(c => ({
        name: c.name,
        budgeted: c.budgeted
      })));
      
      // Calculate total budgeted from all categories
      const totalBudgeted = allCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
      console.log("Total budgeted calculated:", totalBudgeted);
      
      // Update budget totals
      const totalBudgetAmount = budget.totalBudgeted + budget.totalAvailable;
      console.log("Total budget amount:", totalBudgetAmount);
      
      const newTotalAvailable = totalBudgetAmount - totalBudgeted;
      console.log("New values to set:", {
        totalBudgeted: totalBudgeted,
        totalAvailable: newTotalAvailable
      });

      const updateResult = await Budget.findByIdAndUpdate(budget._id, {
        totalBudgeted: totalBudgeted,
        totalAvailable: newTotalAvailable,
      }, { new: true });

      console.log("Budget updated:", {
        _id: updateResult._id,
        totalBudgeted: updateResult.totalBudgeted,
        totalAvailable: updateResult.totalAvailable
      });
    } else {
      console.log("No budget found for sectionId:", sectionId);
    }

    console.log("=== CATEGORY CREATION DEBUG END ===");

    return NextResponse.json(savedCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
