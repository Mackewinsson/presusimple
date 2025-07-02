import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Expense from "../../../models/Expense";

// GET /api/expenses - Get all expenses or filter by user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    if (userId) {
      // Filter by user
      const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
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

    const expense = new Expense({
      user,
      budget,
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
