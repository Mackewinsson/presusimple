import {
  buildSpendingChartData,
  buildTrendData,
  buildBurndownData,
  buildCashFlowData,
  calculateSavingsRate,
  getOverspentCategories,
} from "@/lib/budget-chart-data";
import {
  getHistoryBasePath,
  isHistoryListPath,
  isHistorySubPath,
} from "@/lib/budget-routes";

describe("budget-chart-data", () => {
  const categories = [
    { name: "Food", budgeted: 500, spent: 600 },
    { name: "Rent", budgeted: 1000, spent: 1000 },
    { name: "Fun", budgeted: 200, spent: 50 },
  ];

  it("builds spending chart data sorted by spent", () => {
    const data = buildSpendingChartData(categories);
    expect(data[0].name).toBe("Rent");
    expect(data.find((d) => d.name === "Food")?.overBudget).toBe(true);
    expect(data).toHaveLength(3);
  });

  it("builds trend data from expenses", () => {
    const expenses = [
      { amount: 50, date: "2024-01-05", type: "expense" as const },
      { amount: 100, date: "2024-01-10", type: "income" as const },
    ];
    expect(buildTrendData(expenses)).toEqual([
      { date: "2024-01-05", amount: 50 },
    ]);
  });

  it("builds burndown and cash flow data", () => {
    const expenses = [
      { amount: 30, date: "2024-01-05", type: "expense" as const },
      { amount: 100, date: "2024-01-10", type: "income" as const },
    ];
    expect(buildBurndownData(expenses)).toEqual([
      { date: "2024-01-05", spent: 30 },
    ]);
    expect(buildCashFlowData(expenses)).toEqual([
      { date: "2024-01-05", income: 0, expense: 30 },
      { date: "2024-01-10", income: 100, expense: 0 },
    ]);
  });

  it("calculates savings rate", () => {
    expect(calculateSavingsRate(1000, 800)).toBe(20);
    expect(calculateSavingsRate(0, 0)).toBeNull();
  });

  it("returns overspent categories sorted by over amount", () => {
    const overspent = getOverspentCategories(categories);
    expect(overspent).toHaveLength(1);
    expect(overspent[0].name).toBe("Food");
    expect(overspent[0].overBy).toBe(100);
  });
});

describe("budget-routes history helpers", () => {
  it("returns locale-aware history base path", () => {
    expect(getHistoryBasePath("/history")).toBe("/history");
    expect(getHistoryBasePath("/es/history")).toBe("/es/history");
  });

  it("detects history list vs sub paths", () => {
    expect(isHistoryListPath("/history")).toBe(true);
    expect(isHistoryListPath("/es/history")).toBe(true);
    expect(isHistoryListPath("/history/abc123")).toBe(false);

    expect(isHistorySubPath("/history/abc123")).toBe(true);
    expect(isHistorySubPath("/history/insights")).toBe(true);
    expect(isHistorySubPath("/es/history/abc123")).toBe(true);
    expect(isHistorySubPath("/history")).toBe(false);
  });
});
