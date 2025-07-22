import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user");

  if (userId) {
    // Convert string user ID to ObjectId if it's a string
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    
    // Filter by user and sort by creation date (newest first)
    const budgets = await Budget.find({ user: userObjectId }).sort({ createdAt: -1 });
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
  
  // Convert string user ID to ObjectId if it's a string
  if (data.user && typeof data.user === 'string') {
    try {
      data.user = new mongoose.Types.ObjectId(data.user);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
  }
  
  const budget = await Budget.create(data);
  return NextResponse.json(budget, { status: 201 });
}
