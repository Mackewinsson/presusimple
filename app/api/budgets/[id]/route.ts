import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const budget = await Budget.findById(params.id);
  if (!budget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(budget);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const data = await req.json();
  const budget = await Budget.findByIdAndUpdate(params.id, data, { new: true });
  if (!budget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(budget);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const budget = await Budget.findByIdAndDelete(params.id);
  if (!budget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
