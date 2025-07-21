import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Expense from "../../../models/Expense";
import mongoose from "mongoose";

// GET /api/expenses - Get all expenses or filter by user
export async function GET(request: NextRequest) {
  try {
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
      
      // Filter by user
      const expenses = await Expense.find({ user: userObjectId }).sort({ date: -1 });
      return NextResponse.json(expenses);
    } else {
      // Get all expenses (for admin purposes)
      const expenses = await Expense.find({}).sort({ date: -1 });
      return NextResponse.json(expenses);
    }
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { user, budget, categoryId, amount, description, date, type } = body;

    if (
      !user ||
      !budget ||
      !categoryId ||
      amount === undefined ||
      !description ||
      !date ||
      !type
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: user, budget, categoryId, amount, description, date, type",
        },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds if they're strings
    let userObjectId, budgetObjectId;
    try {
      userObjectId = typeof user === 'string' ? new mongoose.Types.ObjectId(user) : user;
      budgetObjectId = typeof budget === 'string' ? new mongoose.Types.ObjectId(budget) : budget;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid user or budget ID format" },
        { status: 400 }
      );
    }

    const expense = new Expense({
      user: userObjectId,
      budget: budgetObjectId,
      categoryId,
      amount,
      description,
      date,
      type,
    });

    const savedExpense = await expense.save();
    return NextResponse.json(savedExpense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
