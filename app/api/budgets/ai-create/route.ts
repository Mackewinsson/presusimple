import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { functionSchema } from "@/lib/openai-functions";
import { systemPrompt } from "@/lib/openai-prompts";

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (userLimit.count >= 5) { // Max 5 requests per minute
    return false;
  }
  
  userLimit.count++;
  return true;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { description, userId } = await request.json();

    // Edge case: Validate required fields
    if (!description || !userId) {
      return NextResponse.json(
        { error: "Description and userId are required" },
        { status: 400 }
      );
    }

    // Edge case: Validate description length
    if (description.trim().length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters long" },
        { status: 400 }
      );
    }

    // Edge case: Validate description content
    if (description.length > 1000) {
      return NextResponse.json(
        { error: "Description is too long. Please keep it under 1000 characters." },
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

    // Call OpenAI with function calling
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: description }
        ],
        functions: [functionSchema],
        function_call: { name: "extract_budget_data" },
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
        if (openaiError.message.includes('timeout')) {
          return NextResponse.json(
            { error: "AI service is taking too long to respond. Please try again." },
            { status: 408 }
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
        { error: "Unable to understand your budget description. Please try being more specific about your income and expenses." },
        { status: 500 }
      );
    }

    let budgetData;
    try {
      budgetData = JSON.parse(functionCall.arguments);
    } catch (parseError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Edge case: Validate the data structure
    if (!budgetData || typeof budgetData !== 'object') {
      return NextResponse.json(
        { error: "Invalid response format from AI. Please try again." },
        { status: 500 }
      );
    }

    // Edge case: Validate income
    if (typeof budgetData.income !== 'number' || budgetData.income <= 0) {
      return NextResponse.json(
        { error: "Unable to extract a valid income amount. Please be more specific about your income." },
        { status: 400 }
      );
    }

    // Edge case: Validate income is reasonable
    if (budgetData.income > 1000000) {
      return NextResponse.json(
        { error: "Income amount seems too high. Please check your description." },
        { status: 400 }
      );
    }

    // Edge case: Validate categories exist
    if (!budgetData.categories || !Array.isArray(budgetData.categories) || budgetData.categories.length === 0) {
      return NextResponse.json(
        { error: "Unable to extract budget categories. Please be more specific about your expenses." },
        { status: 400 }
      );
    }

    // Edge case: Validate each category
    for (const category of budgetData.categories) {
      if (!category.name || typeof category.name !== 'string' || category.name.trim().length === 0) {
        return NextResponse.json(
          { error: "Invalid category name detected. Please try again." },
          { status: 400 }
        );
      }
      if (typeof category.amount !== 'number' || category.amount < 0) {
        return NextResponse.json(
          { error: `Invalid amount for category "${category.name}". Please check your description.` },
          { status: 400 }
        );
      }
    }

    const totalCategories = budgetData.categories.reduce((sum: number, cat: any) => sum + cat.amount, 0);
    
    // Edge case: Check for excessive spending
    if (totalCategories > budgetData.income * 1.2) {
      return NextResponse.json(
        { error: "Total expenses exceed income by more than 20%. Please check your budget amounts." },
        { status: 400 }
      );
    }
    
    // Don't automatically add savings - let the user decide
    // The budget will have the remaining amount as available

    // Add sectionName to each category
    const categoriesWithSection = budgetData.categories.map((cat: any) => ({
      ...cat,
      sectionName: "General"
    }));



    return NextResponse.json({
      income: budgetData.income,
      sections: [{ name: "General" }],
      categories: categoriesWithSection
    });

  } catch (error) {
    console.error("AI budget creation error:", error);
    return NextResponse.json(
      { error: `Failed to process budget request: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 