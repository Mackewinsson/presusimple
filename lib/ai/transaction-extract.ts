import { Part } from "@google/generative-ai";
import { callGeminiTool } from "@/lib/ai/gemini-client";
import { parseImageBase64 } from "@/lib/ai/parse-image";
import { transactionSystemPrompt } from "@/lib/ai/prompts/transaction";
import {
  ExtractTransactionsResponse,
  transactionFunctionDeclaration,
} from "@/lib/ai/schemas/transaction";

function buildTransactionPrompt(categories?: string[]): string {
  const availableCategories =
    categories && categories.length > 0
      ? `\n\nAVAILABLE CATEGORIES (you MUST use ONLY these): ${categories.join(", ")}`
      : "";

  return (
    transactionSystemPrompt +
    availableCategories +
    "\n\nCRITICAL: You MUST use ONLY the available categories listed above. NEVER create new categories. If no exact match exists, choose the closest available category from the list provided.\n\nWhen categorizing transactions:\n- For food/dining: prefer categories like \"Food\", \"Groceries\", \"Dining\"\n- For transportation: prefer categories like \"Transport\", \"Gas\", \"Transportation\"\n- For housing: prefer categories like \"Rent\", \"Housing\", \"Utilities\"\n- For entertainment: prefer categories like \"Entertainment\", \"Leisure\", \"Fun\"\n- For income: prefer categories like \"Income\", \"Salary\", \"Savings\"\n\nIf the best category is not available, suggest the next best alternative from the available list."
  );
}

function buildUserParts(
  description?: string,
  imageBase64?: string
): Part[] {
  if (imageBase64) {
    const { mimeType, data } = parseImageBase64(imageBase64);
    return [
      {
        text:
          description ||
          "Extract the transactions from this receipt or bank statement screenshot.",
      },
      { inlineData: { mimeType, data } },
    ];
  }

  return [{ text: description ?? "" }];
}

export async function extractTransactionsFromInput({
  description,
  imageBase64,
  categories,
}: {
  description?: string;
  imageBase64?: string;
  categories?: string[];
}): Promise<ExtractTransactionsResponse> {
  return callGeminiTool<ExtractTransactionsResponse>({
    systemInstruction: buildTransactionPrompt(categories),
    userParts: buildUserParts(description, imageBase64),
    toolDeclaration: transactionFunctionDeclaration,
  });
}
