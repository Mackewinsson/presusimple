import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import mongoose from "mongoose";

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get budgets
 *     description: Retrieve budgets for a specific user or all budgets (admin)
 *     tags: [Budgets]
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: User ID to filter budgets
 *         example: "688250e72a4d1976843ee892"
 *     responses:
 *       200:
 *         description: List of budgets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Budget'
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

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create a new budget
 *     description: Create a new budget for a user
 *     tags: [Budgets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user, name, sections]
 *             properties:
 *               user:
 *                 type: string
 *                 description: User ID
 *                 example: "688250e72a4d1976843ee892"
 *               name:
 *                 type: string
 *                 description: Budget name
 *                 example: "Monthly Budget 2024"
 *               sections:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/BudgetSection'
 *               totalAmount:
 *                 type: number
 *                 description: Total budget amount
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Budget created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Budget'
 *       400:
 *         description: Invalid user ID format or missing required fields
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
