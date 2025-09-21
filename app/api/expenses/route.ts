import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Expense from "../../../models/Expense";
import mongoose from "mongoose";

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get expenses
 *     description: Retrieve expenses for a specific user or all expenses (admin)
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: User ID to filter expenses
 *         example: "688250e72a4d1976843ee892"
 *     responses:
 *       200:
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid user ID format"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */
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

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     description: Create a new expense entry for a user
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user, budget, categoryId, amount, description, date, type]
 *             properties:
 *               user:
 *                 type: string
 *                 description: User ID
 *                 example: "688250e72a4d1976843ee892"
 *               budget:
 *                 type: string
 *                 description: Budget ID
 *                 example: "688250e72a4d1976843ee893"
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *                 example: "688250e72a4d1976843ee894"
 *               amount:
 *                 type: number
 *                 description: Expense amount
 *                 example: 25.50
 *               description:
 *                 type: string
 *                 description: Expense description
 *                 example: "Coffee at Starbucks"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Expense date
 *                 example: "2024-01-15"
 *               type:
 *                 type: string
 *                 description: Expense type
 *                 example: "expense"
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Missing required fields or invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missing_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   error: "Missing required fields: user, budget, categoryId, amount, description, date, type"
 *               invalid_ids:
 *                 summary: Invalid ID format
 *                 value:
 *                   error: "Invalid user or budget ID format"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to create expense"
 */
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
