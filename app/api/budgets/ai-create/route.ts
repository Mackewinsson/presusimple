import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { functionSchema } from "@/lib/openai-functions";
import { systemPrompt } from "@/lib/openai-prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { description, userId } = await request.json();

    if (!description || !userId) {
      return NextResponse.json(
        { error: "Description and userId are required" },
        { status: 400 }
      );
    }

    // Call OpenAI with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: description }
      ],
      functions: [functionSchema],
      function_call: { name: "extract_budget_data" },
    });

    const functionCall = completion.choices[0]?.message?.function_call;
    
    if (!functionCall) {
      return NextResponse.json(
        { error: "Failed to extract budget data" },
        { status: 500 }
      );
    }

    const budgetData = JSON.parse(functionCall.arguments);

    // Validate the data
    if (typeof budgetData.income !== 'number' || budgetData.income <= 0) {
      return NextResponse.json(
        { error: "Invalid income amount" },
        { status: 400 }
      );
    }

    const totalCategories = budgetData.categories.reduce((sum: number, cat: any) => sum + cat.amount, 0);
    
    // If the sum doesn't match income, add the difference as "Savings"
    if (Math.abs(totalCategories - budgetData.income) > 0.01) {
      const difference = budgetData.income - totalCategories;
      if (difference > 0) {
        budgetData.categories.push({
          name: "Savings",
          amount: difference
        });
      }
    }

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