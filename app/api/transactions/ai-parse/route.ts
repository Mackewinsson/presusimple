import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { transactionFunctionSchema } from "@/lib/openai-transaction-functions";
import { transactionSystemPrompt } from "@/lib/openai-transaction-prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (userLimit.count >= 10) { // Max 10 requests per minute
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { description, userId, budgetId, categories } = await request.json();

    // Edge case: Validate required fields
    if (!description || !userId || !budgetId) {
      return NextResponse.json(
        { error: "Description, userId, and budgetId are required" },
        { status: 400 }
      );
    }

    // Edge case: Validate description length
    if (description.trim().length < 3) {
      return NextResponse.json(
        { error: "Description must be at least 3 characters long" },
        { status: 400 }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        { error: "Description is too long. Please keep it under 500 characters." },
        { status: 400 }
      );
    }

    // Edge case: Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
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

    // Create enhanced system prompt with available categories
    const availableCategories = categories && categories.length > 0 
      ? `\n\nAVAILABLE CATEGORIES (you MUST use ONLY these): ${categories.join(', ')}`
      : '';
    
    const enhancedPrompt = transactionSystemPrompt + availableCategories + 
      '\n\nCRITICAL: You MUST use ONLY the available categories listed above. NEVER create new categories. If no exact match exists, choose the closest available category from the list provided.';

    // Debug logging


    // Call OpenAI with function calling
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: enhancedPrompt },
          { role: "user", content: description }
        ],
        functions: [transactionFunctionSchema],
        function_call: { name: "extract_transactions" },
      });
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      if (openaiError instanceof Error) {
        if (openaiError.message.includes('401')) {
          return NextResponse.json(
            { error: "AI service authentication failed. Please contact support." },
            { status: 500 }
          );
        }
        if (openaiError.message.includes('429')) {
          return NextResponse.json(
            { error: "AI service is busy. Please try again in a moment." },
            { status: 429 }
          );
        }
      }
      return NextResponse.json(
        { error: "AI service is temporarily unavailable. Please try again later." },
        { status: 500 }
      );
    }

    const functionCall = completion.choices[0]?.message?.function_call;
    
    if (!functionCall) {
      return NextResponse.json(
        { error: "Unable to understand your transaction description. Please try being more specific." },
        { status: 500 }
      );
    }

    let transactionData;
    try {
      transactionData = JSON.parse(functionCall.arguments);
      // Debug logging
      
      if (transactionData.transactions && transactionData.transactions.length > 0) {
        transactionData.transactions.forEach((tx: any, index: number) => {
          // Transaction processing
        });
      }
    } catch (parseError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
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
      
      // Validate that the category exists in the available categories
      if (categories && categories.length > 0) {
        const categoryExists = categories.some((cat: string) => 
          cat.toLowerCase() === transaction.category.toLowerCase()
        );
        if (!categoryExists) {
          return NextResponse.json(
            { error: `Category "${transaction.category}" is not available in your budget. Available categories: ${categories.join(', ')}` },
            { status: 400 }
          );
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