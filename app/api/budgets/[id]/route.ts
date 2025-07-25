import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import Category from "@/models/Category";
import Expense from "@/models/Expense";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  const budget = await Budget.findById(id);
  if (!budget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(budget);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  const data = await req.json();
  
  console.log("Budget API PUT - Updating budget:", { id, data });
  
  const budget = await Budget.findByIdAndUpdate(id, data, { new: true });
  if (!budget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  console.log("Budget API PUT - Updated budget:", {
    _id: budget._id,
    totalBudgeted: budget.totalBudgeted,
    totalAvailable: budget.totalAvailable
  });
  
  return NextResponse.json(budget);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  const budget = await Budget.findByIdAndDelete(id);
  if (!budget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cascade delete: delete all categories for this budget's sections
  const sectionIds = budget.sections.map(
    (section: any) => section._id || section.name
  );
  await Category.deleteMany({ sectionId: { $in: sectionIds } });
  // Delete all expenses for this budget
  await Expense.deleteMany({ budget: budget._id });

  return NextResponse.json({ success: true });
}
