import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import MonthlyBudget from "@/models/MonthlyBudget";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const monthlyBudget = await MonthlyBudget.findByIdAndDelete(params.id);
  if (!monthlyBudget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
