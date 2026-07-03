export const FEATURES = {
  aiBudgeting: {
    label: "AI Budgeting",
    description: "Create budgets using natural language with AI",
    plans: ["pro"]
  },
  transactionTextInput: {
    label: "Text-to-Transaction Input",
    description: "Convert text descriptions into transactions with AI",
    plans: ["pro"]
  },
  exportCSV: {
    label: "CSV Export",
    description: "Export your budget data to CSV format",
    plans: ["free", "pro"]
  },
  manualBudget: {
    label: "Manual Budget Setup",
    description: "Create budgets manually with categories and sections",
    plans: ["free", "pro"]
  },
  advancedAnalytics: {
    label: "Advanced Analytics",
    description: "Detailed spending insights and charts",
    plans: ["pro"]
  },
  unlimitedCategories: {
    label: "Unlimited Categories",
    description: "Create unlimited budget categories",
    plans: ["free", "pro"]
  },
  // budgetTemplates: {
  //   label: "Budget Templates",
  //   description: "Save and reuse budget templates",
  //   plans: ["pro"]
  // },
  // savingsGoals: {
  //   label: "Savings Goals",
  //   description: "Track progress towards savings targets",
  //   plans: ["pro"]
  // },
  prioritySupport: {
    label: "Priority Support",
    description: "Get priority customer support",
    plans: ["pro"]
  }
} as const;

export type FeatureKey = keyof typeof FEATURES; 