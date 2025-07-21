export const functionSchema = {
  name: "extract_budget_data",
  description: "Extract structured budget data from a user description",
  parameters: {
    type: "object",
    properties: {
      income: { type: "number", description: "Total monthly income" },
      categories: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            amount: { type: "number" }
          },
          required: ["name", "amount"]
        }
      }
    },
    required: ["income", "categories"]
  }
} as const;

export type ExtractBudgetDataResponse = {
  income: number;
  categories: Array<{
    name: string;
    amount: number;
  }>;
}; 