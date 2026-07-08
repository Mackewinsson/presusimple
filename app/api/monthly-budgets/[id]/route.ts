import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import MonthlyBudget from "@/models/MonthlyBudget";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const monthlyBudget = await MonthlyBudget.findById(id);
    if (!monthlyBudget) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(monthlyBudget);
  } catch (error) {
    console.error("Error fetching monthly budget:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly budget" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  const monthlyBudget = await MonthlyBudget.findByIdAndDelete(id);
  if (!monthlyBudget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
