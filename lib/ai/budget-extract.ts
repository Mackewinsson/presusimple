import { callGeminiTool } from "@/lib/ai/gemini-client";
import { budgetSystemPrompt } from "@/lib/ai/prompts/budget";
import {
  budgetFunctionDeclaration,
  ExtractBudgetDataResponse,
} from "@/lib/ai/schemas/budget";

export async function extractBudgetFromDescription(
  description: string
): Promise<ExtractBudgetDataResponse> {
  return callGeminiTool<ExtractBudgetDataResponse>({
    systemInstruction: budgetSystemPrompt,
    userParts: [{ text: description }],
    toolDeclaration: budgetFunctionDeclaration,
  });
}
