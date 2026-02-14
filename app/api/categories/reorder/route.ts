import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Category from "@/models/Category";

/**
 * POST /api/categories/reorder
 * Body: { budgetId: string, categoryIds: string[] } (ordered list of category IDs)
 * Updates each category's order to its index in categoryIds.
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { budgetId, categoryIds } = body;

    if (!budgetId || !Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: "Missing required fields: budgetId, categoryIds" },
        { status: 400 }
      );
    }

    const categories = await Category.find({ _id: { $in: categoryIds } });

    const invalidIds = categoryIds.filter(
      (id: string) => !categories.some((c) => c._id.toString() === id)
    );
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "Some category IDs not found", invalidIds },
        { status: 400 }
      );
    }

    const budgetIdStr = String(budgetId);
    const notInBudget = categories.filter(
      (c) => String(c.budgetId) !== budgetIdStr
    );
    if (notInBudget.length > 0) {
      return NextResponse.json(
        { error: "Some categories do not belong to the given budget" },
        { status: 400 }
      );
    }

    const bulkOps = categoryIds.map((id: string, index: number) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } },
      },
    }));

    await Category.bulkWrite(bulkOps);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering categories:", error);
    return NextResponse.json(
      { error: "Failed to reorder categories" },
      { status: 500 }
    );
  }
}
