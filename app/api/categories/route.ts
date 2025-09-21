import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Category from "../../../models/Category";
import Budget from "../../../models/Budget";

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get categories
 *     description: Retrieve categories for a specific user or budget
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: User ID to filter categories
 *         example: "688250e72a4d1976843ee892"
 *       - in: query
 *         name: budget
 *         schema:
 *           type: string
 *         description: Budget ID to filter categories
 *         example: "688250e72a4d1976843ee893"
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
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
    const budgetId = searchParams.get("budget");

    if (userId) {
      // Get user's budget first
      const budget = await Budget.findOne({ user: userId });
      if (!budget) {
        return NextResponse.json([]);
      }

      // Get categories for this budget (using budgetId for backend logic)
      const categories = await Category.find({
        budgetId: budget._id,
      }).sort({ createdAt: -1 });

      return NextResponse.json(categories);
    } else if (budgetId) {
      // Get categories for a specific budget
      const budget = await Budget.findById(budgetId);
      if (!budget) {
        return NextResponse.json([]);
      }

      // Get categories for this budget (using budgetId for backend logic)
      const categories = await Category.find({
        budgetId: budget._id,
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

    const { name, budgeted, budgetId } = body;

    if (!name || budgeted === undefined || !budgetId) {
      return NextResponse.json(
        { error: "Missing required fields: name, budgeted, budgetId" },
        { status: 400 }
      );
    }

    if (budgeted < 0) {
      return NextResponse.json(
        { error: "Budgeted amount cannot be negative" },
        { status: 400 }
      );
    }

    // Temporarily disabled validation to debug
    // Check if category with same name already exists in this section
    // const existingCategory = await Category.findOne({
    //   name: name.trim(),
    //   sectionId: sectionId
    // });

    // if (existingCategory) {
    //   return NextResponse.json(
    //     { error: `Category "${name}" already exists in this section` },
    //     { status: 400 }
    //   );
    // }



    const category = new Category({
      name,
      budgeted,
      spent: 0,
      budgetId,
    });

    const savedCategory = await category.save();

    // Update the budget's totalBudgeted to reflect the new category
    const budget = await Budget.findById(budgetId);
    
    if (budget) {
      // Get all categories for this budget (including the newly created one)
      const allCategories = await Category.find({
        budgetId: budget._id,
      });
      
      // Calculate total budgeted from all categories
      const totalBudgeted = allCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
      
      // Update budget totals atomically
      const totalBudgetAmount = budget.totalBudgeted + budget.totalAvailable;
      const newTotalAvailable = Math.max(0, totalBudgetAmount - totalBudgeted);

      const updatedBudget = await Budget.findByIdAndUpdate(budget._id, {
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
