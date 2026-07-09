import { NextRequest, NextResponse } from "next/server";
import { isGeminiConfigured } from "@/lib/ai/config";
import { AIServiceError } from "@/lib/ai/errors";
import { aiServiceErrorResponse } from "@/lib/ai/route-errors";
import { extractTransactionsFromInput } from "@/lib/ai/transaction-extract";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { hasAccess } from "@/lib/userAccess";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (userLimit.count >= 10) {
    // Max 10 requests per minute
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * @swagger
 * /api/transactions/ai-parse:
 *   post:
 *     summary: Parse transaction using AI
 *     description: Use Google Gemini to intelligently parse and categorize transaction descriptions
 *     tags: [AI, Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, userId]
 *             properties:
 *               description:
 *                 type: string
 *                 description: Raw transaction description to parse
 *                 example: "STARBUCKS COFFEE #1234 NEW YORK NY"
 *               userId:
 *                 type: string
 *                 description: User ID for rate limiting
 *                 example: "688250e72a4d1976843ee892"
 *               amount:
 *                 type: number
 *                 description: Transaction amount (optional, helps with categorization)
 *                 example: 4.50
 *     responses:
 *       200:
 *         description: Transaction parsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 parsed:
 *                   type: object
 *                   properties:
 *                     merchant:
 *                       type: string
 *                       example: "Starbucks"
 *                     category:
 *                       type: string
 *                       example: "Food & Dining"
 *                     subcategory:
 *                       type: string
 *                       example: "Coffee"
 *                     location:
 *                       type: string
 *                       example: "New York, NY"
 *                     confidence:
 *                       type: number
 *                       example: 0.95
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Missing required fields: description, userId"
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Rate limit exceeded. Please try again later."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to parse transaction"
 */
export async function POST(request: NextRequest) {
  try {
    const { description, imageBase64, userId, budgetId, categories } = await request.json();

    // Edge case: Validate required fields
    if ((!description && !imageBase64) || !userId || !budgetId) {
      return NextResponse.json(
        { error: "Description or image, userId, and budgetId are required" },
        { status: 400 }
      );
    }

    // Edge case: Validate description length if provided
    if (description && description.trim().length > 0 && description.trim().length < 3) {
      return NextResponse.json(
        { error: "Description must be at least 3 characters long" },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: "Description is too long. Please keep it under 500 characters." },
        { status: 400 }
      );
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Edge case: Rate limiting
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!hasAccess(user, "transactionTextInput")) {
      return NextResponse.json(
        { error: "Pro subscription required for AI transaction input" },
        { status: 403 }
      );
    }

    let transactionData;
    try {
      transactionData = await extractTransactionsFromInput({
        description,
        imageBase64,
        categories,
      });
    } catch (error) {
      console.error("Gemini API error:", error);
      if (error instanceof AIServiceError) {
        if (error.code === "parse") {
          return NextResponse.json(
            {
              error:
                "Unable to understand your transaction description. Please try being more specific.",
            },
            { status: 500 }
          );
        }
        return aiServiceErrorResponse(error);
      }
      return NextResponse.json(
        {
          error: "AI service is temporarily unavailable. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Edge case: Validate the data structure
    if (!transactionData || !transactionData.transactions || !Array.isArray(transactionData.transactions)) {
      return NextResponse.json(
        { error: "Invalid response format from AI. Please try again." },
        { status: 500 }
      );
    }

    // Edge case: Validate each transaction
    for (const transaction of transactionData.transactions) {
      if (!transaction.description || typeof transaction.description !== 'string' || transaction.description.trim().length === 0) {
        return NextResponse.json(
          { error: "Invalid transaction description detected. Please try again." },
          { status: 400 }
        );
      }
      if (typeof transaction.amount !== 'number' || transaction.amount <= 0) {
        return NextResponse.json(
          { error: `Invalid amount for transaction "${transaction.description}". Please check your description.` },
          { status: 400 }
        );
      }
      if (!transaction.type || !['expense', 'income'].includes(transaction.type)) {
        return NextResponse.json(
          { error: `Invalid transaction type for "${transaction.description}". Must be expense or income.` },
          { status: 400 }
        );
      }
      if (!transaction.category || typeof transaction.category !== 'string' || transaction.category.trim().length === 0) {
        return NextResponse.json(
          { error: `Invalid category for transaction "${transaction.description}". Please try again.` },
          { status: 400 }
        );
      }
      
      // If the AI suggested a category not in the user's list, add suggestions
      // but DO NOT reject — the frontend review modal handles missing categories gracefully
      if (categories && categories.length > 0) {
        const categoryExists = categories.some((cat: string) => 
          cat.toLowerCase() === transaction.category.toLowerCase()
        );
        if (!categoryExists) {
          // Attach suggested alternatives from the available categories
          transaction.suggestedCategories = categories.slice(0, 5);
        }
      }
    }

    // Edge case: Check for reasonable amounts
    for (const transaction of transactionData.transactions) {
      if (transaction.amount > 100000) {
        return NextResponse.json(
          { error: `Amount for "${transaction.description}" seems too high. Please check your description.` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      transactions: transactionData.transactions
    });

  } catch (error) {
    console.error("Transaction parsing error:", error);
    return NextResponse.json(
      { error: `Failed to process transaction request: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 