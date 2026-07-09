import { FunctionDeclaration, SchemaType } from "@google/generative-ai";

export const transactionFunctionDeclaration: FunctionDeclaration = {
  name: "extract_transactions",
  description: "Extracts a list of transactions from natural language input",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      transactions: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            description: { type: SchemaType.STRING },
            amount: { type: SchemaType.NUMBER },
            type: {
              type: SchemaType.STRING,
              format: "enum",
              enum: ["expense", "income"],
            },
            category: { type: SchemaType.STRING },
            suggestedCategories: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description:
                "Optional: Suggested better category names if the chosen category is not ideal",
            },
          },
          required: ["description", "amount", "type", "category"],
        },
      },
    },
    required: ["transactions"],
  },
};

export type ExtractTransactionsResponse = {
  transactions: Array<{
    description: string;
    amount: number;
    type: "expense" | "income";
    category: string;
    suggestedCategories?: string[];
  }>;
};
