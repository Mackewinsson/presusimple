import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user");

  if (userId) {
    // Filter by user
    const budgets = await Budget.find({ user: userId });
    return NextResponse.json(budgets);
  } else {
    // Get all budgets (for admin purposes)
    const budgets = await Budget.find({});
    return NextResponse.json(budgets);
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const budget = await Budget.create(data);
  return NextResponse.json(budget, { status: 201 });
}
