// These are lightweight unit-style tests that validate internal calculations
// used by sync/reset routes using mocked data, without invoking Next runtime.

import { describe, it, expect } from "@jest/globals";

type Category = { budgeted: number };

function calcTotalBudgeted(categories: Category[]): number {
  return categories.reduce((sum, c) => sum + (c?.budgeted || 0), 0);
}

function calcNewTotals(totalBudgetAmount: number, totalBudgeted: number) {
  const totalAvailable = Math.max(0, totalBudgetAmount - totalBudgeted);
  return { totalBudgeted, totalAvailable };
}

describe("budget totals math (sync/reset)", () => {
  it("sums category budgeted correctly", () => {
    const cats = [{ budgeted: 100 }, { budgeted: 50 }, { budgeted: 0 }];
    expect(calcTotalBudgeted(cats)).toBe(150);
  });

  it("handles empty categories", () => {
    expect(calcTotalBudgeted([])).toBe(0);
  });

  it("computes new totals with non-negative available", () => {
    const totalBudgetAmount = 500; // budgeted + available
    const totalBudgeted = 450;
    const { totalAvailable } = calcNewTotals(totalBudgetAmount, totalBudgeted);
    expect(totalAvailable).toBe(50);
  });

  it("caps available at 0 if budgeted exceeds total amount", () => {
    const totalBudgetAmount = 300;
    const totalBudgeted = 350;
    const { totalAvailable } = calcNewTotals(totalBudgetAmount, totalBudgeted);
    expect(totalAvailable).toBe(0);
  });
});

