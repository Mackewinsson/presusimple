export interface BudgetCategoryInput {
  name: string;
  budgeted: number;
  spent: number;
}

export interface BudgetExpenseInput {
  amount: number;
  date: string;
  type: "expense" | "income";
}

export interface SpendingChartItem {
  name: string;
  spent: number;
  budgeted: number;
  overBudget: boolean;
}

export interface TrendChartItem {
  date: string;
  amount: number;
}

export interface BurndownChartItem {
  date: string;
  spent: number;
}

export interface CashFlowChartItem {
  date: string;
  income: number;
  expense: number;
}

const TOP_CATEGORY_LIMIT = 8;

export function buildTopSpendingCategories(
  categories: BudgetCategoryInput[]
): BudgetCategoryInput[] {
  return [...categories]
    .filter((cat) => cat.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, TOP_CATEGORY_LIMIT);
}

export function buildSpendingChartData(
  categories: BudgetCategoryInput[]
): SpendingChartItem[] {
  return buildTopSpendingCategories(categories)
    .map((cat) => ({
      name: cat.name,
      spent: Number(cat.spent) || 0,
      budgeted: Number(cat.budgeted) || 0,
      overBudget: (Number(cat.spent) || 0) > (Number(cat.budgeted) || 0),
    }))
    .filter((item) => item.budgeted > 0 || item.spent > 0);
}

export function buildTrendData(expenses: BudgetExpenseInput[]): TrendChartItem[] {
  return expenses
    .filter((e) => e.type === "expense")
    .map((e) => ({ date: e.date, amount: e.amount }));
}

export function buildBurndownData(
  expenses: BudgetExpenseInput[]
): BurndownChartItem[] {
  return expenses
    .filter((e) => e.type === "expense")
    .map((e) => ({ date: e.date, spent: e.amount }));
}

export function buildCashFlowData(
  expenses: BudgetExpenseInput[]
): CashFlowChartItem[] {
  return expenses.map((e) => {
    const isIncome = e.type?.toLowerCase() === "income";
    return {
      date: e.date,
      income: isIncome ? e.amount : 0,
      expense: !isIncome ? e.amount : 0,
    };
  });
}

export function calculateSavingsRate(
  totalBudgeted: number,
  totalSpent: number
): number | null {
  if (totalBudgeted <= 0) return null;
  return ((totalBudgeted - totalSpent) / totalBudgeted) * 100;
}

export interface OverspentCategory {
  name: string;
  budgeted: number;
  spent: number;
  overBy: number;
}

export function getOverspentCategories(
  categories: BudgetCategoryInput[]
): OverspentCategory[] {
  return categories
    .filter((cat) => cat.spent > cat.budgeted)
    .map((cat) => ({
      name: cat.name,
      budgeted: cat.budgeted,
      spent: cat.spent,
      overBy: cat.spent - cat.budgeted,
    }))
    .sort((a, b) => b.overBy - a.overBy);
}
