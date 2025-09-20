import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Expense from "../../../../models/Expense";
import mongoose from "mongoose";
import { authenticateRequest, createAuthErrorResponse } from "@/lib/mobileAuth";

// GET /api/expenses/mobile-example - Get expenses with mobile auth support
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request (supports both mobile JWT and NextAuth)
    const auth = await authenticateRequest(request);
    
    await dbConnect();
    
    // Convert user ID to ObjectId
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(auth.userId);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    
    // Get expenses for the authenticated user
    const expenses = await Expense.find({ user: userObjectId }).sort({ date: -1 });
    
    return NextResponse.json({
      expenses,
      user: { id: auth.userId, email: auth.email },
      authMethod: auth.isMobile ? "mobile" : "web"
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication")) {
      return createAuthErrorResponse(error.message);
    }
    
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST /api/expenses/mobile-example - Create expense with mobile auth support
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request);
    
    await dbConnect();
    const body = await request.json();

    const { budget, categoryId, amount, description, date, type } = body;

    if (
      !budget ||
      !categoryId ||
      amount === undefined ||
      !description ||
      !date ||
      !type
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields: budget, categoryId, amount, description, date, type",
        },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    let userObjectId, budgetObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(auth.userId);
      budgetObjectId = typeof budget === 'string' ? new mongoose.Types.ObjectId(budget) : budget;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid budget ID format" },
        { status: 400 }
      );
    }

    const expense = new Expense({
      user: userObjectId, // Use authenticated user ID
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
    if (error instanceof Error && error.message.includes("Authentication")) {
      return createAuthErrorResponse(error.message);
    }
    
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
