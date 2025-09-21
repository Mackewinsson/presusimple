import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import Category from "@/models/Category";
import Expense from "@/models/Expense";

/**
 * @swagger
 * /api/budgets/{id}:
 *   get:
 *     summary: Get a specific budget
 *     description: Retrieve a single budget by ID
 *     tags: [Budgets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *         example: "688250e72a4d1976843ee893"
 *     responses:
 *       200:
 *         description: Budget found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Budget'
 *       404:
 *         description: Budget not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  const budget = await Budget.findById(id);
  if (!budget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(budget);
}

/**
 * @swagger
 * /api/budgets/{id}:
 *   put:
 *     summary: Update a budget
 *     description: Update an existing budget by ID
 *     tags: [Budgets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *         example: "688250e72a4d1976843ee893"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated budget name
 *                 example: "Updated Monthly Budget"
 *               sections:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/BudgetSection'
 *               totalAmount:
 *                 type: number
 *                 description: Updated total budget amount
 *                 example: 6000
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Budget'
 *       404:
 *         description: Budget not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  const data = await req.json();
  
  
  
  const budget = await Budget.findByIdAndUpdate(id, data, { new: true });
  if (!budget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  

  
  return NextResponse.json(budget);
}

/**
 * @swagger
 * /api/budgets/{id}:
 *   delete:
 *     summary: Delete a budget
 *     description: Delete a budget and all associated categories and expenses
 *     tags: [Budgets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *         example: "688250e72a4d1976843ee893"
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Budget not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  const budget = await Budget.findByIdAndDelete(id);
  if (!budget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cascade delete: delete all categories for this budget
  await Category.deleteMany({ budgetId: budget._id });
  // Delete all expenses for this budget
  await Expense.deleteMany({ budget: budget._id });

  return NextResponse.json({ success: true });
}
