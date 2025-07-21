import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import MonthlyBudget from "@/models/MonthlyBudget";

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
