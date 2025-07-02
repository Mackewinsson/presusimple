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

    if (userId) {
      // Get user's budget first
      const budget = await Budget.findOne({ user: userId });
      if (!budget) {
        return NextResponse.json([]);
      }

      // Get section IDs from the budget
      const sectionIds = budget.sections.map(
        (section: any) => section._id || section.name
      );

      // Filter categories by section IDs
      const categories = await Category.find({
        sectionId: { $in: sectionIds },
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

    const category = new Category({
      name,
      budgeted,
      spent: 0,
      sectionId,
    });

    const savedCategory = await category.save();
    return NextResponse.json(savedCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
