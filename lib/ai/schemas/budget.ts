import { FunctionDeclaration, SchemaType } from "@google/generative-ai";

export const budgetFunctionDeclaration: FunctionDeclaration = {
  name: "extract_budget_data",
  description: "Extract structured budget data from a user description",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      income: {
        type: SchemaType.NUMBER,
        description: "Total monthly income",
      },
      categories: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            amount: { type: SchemaType.NUMBER },
          },
          required: ["name", "amount"],
        },
      },
    },
    required: ["income", "categories"],
  },
};

export type ExtractBudgetDataResponse = {
  income: number;
  categories: Array<{
    name: string;
    amount: number;
  }>;
};
