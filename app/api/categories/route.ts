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

      console.log("Categories API: Filtering by budget", {
        budgetId,
        sectionNames,
        budgetSections: budget.sections
      });

      // Filter categories by section names
      const categories = await Category.find({
        sectionId: { $in: sectionNames },
      }).sort({ createdAt: -1 });

      console.log("Categories API: Found categories", {
        categoriesCount: categories.length,
        categories: categories.map(cat => ({ name: cat.name, sectionId: cat.sectionId }))
      });

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

    const { name, budgeted, sectionId, budgetId } = body;

    if (!name || budgeted === undefined || !sectionId) {
      return NextResponse.json(
        { error: "Missing required fields: name, budgeted, sectionId" },
        { status: 400 }
      );
    }

    if (budgeted < 0) {
      return NextResponse.json(
        { error: "Budgeted amount cannot be negative" },
        { status: 400 }
      );
    }

    // Check if category with same name already exists in this section
    const existingCategory = await Category.findOne({
      name: name.trim(),
      sectionId: sectionId
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: `Category "${name}" already exists in this section` },
        { status: 400 }
      );
    }



    const category = new Category({
      name,
      budgeted,
      spent: 0,
      sectionId,
    });

    const savedCategory = await category.save();

    // Update the budget's totalBudgeted to reflect the new category
    let budget;
    
    // If budgetId is provided, use that specific budget
    if (budgetId) {
      budget = await Budget.findById(budgetId);
    } else {
      // Fallback: try to find budget by section name
      budget = await Budget.findOne({ "sections.name": sectionId });
      
      // If not found, try to find budget by section ID (ObjectId)
      if (!budget) {
        budget = await Budget.findOne({ "sections._id": sectionId });
      }
    }
    
    if (budget) {
      // Get all categories for this budget (including the newly created one)
      const sectionNames = budget.sections.map(
        (section: any) => section.name
      );
      const allCategories = await Category.find({
        sectionId: { $in: sectionNames },
      });
      
      // Calculate total budgeted from all categories
      const totalBudgeted = allCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
      
      // Update budget totals atomically
      const totalBudgetAmount = budget.totalBudgeted + budget.totalAvailable;
      const newTotalAvailable = Math.max(0, totalBudgetAmount - totalBudgeted);

      await Budget.findByIdAndUpdate(budget._id, {
        totalBudgeted: totalBudgeted,
        totalAvailable: newTotalAvailable,
      }, { new: true });
    }

    return NextResponse.json(savedCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
