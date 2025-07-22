"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/utils/formatMoney";
import { SpendingChart } from "@/components/ui/SpendingChart";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { FileSpreadsheet } from "lucide-react";
import { utils, writeFile } from "xlsx";
import { toast } from "sonner";
import type { Budget } from "@/lib/api";

interface Category {
  _id?: string;
  id?: string;
  name: string;
  budgeted: number;
  spent: number;
  sectionId: string;
}

interface Expense {
  _id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  type: "expense" | "income";
}

interface SummaryProps {
  budget: Budget;
  categories: Category[];
  expenses: Expense[];
}

const Summary: React.FC<SummaryProps> = ({ budget, categories, expenses }) => {
  // Calculate total spent from expenses
  const totalSpent = expenses.reduce((sum, expense) => {
    return (
      sum + (expense.type === "expense" ? expense.amount : -expense.amount)
    );
  }, 0);

  // Calculate total budgeted from categories (this should match database totalBudgeted)
  const calculatedTotalBudgeted = categories.reduce(
    (sum, cat) => sum + cat.budgeted,
    0
  );

  // Calculate spent for each category from expenses
  const categoriesWithSpent = categories.map((category) => {
    const spent = expenses
      .filter((exp) => exp.categoryId === (category._id || category.id))
      .reduce((sum, exp) => {
        if (exp.type === "expense") return sum + exp.amount;
        if (exp.type === "income") return sum - exp.amount;
        return sum;
      }, 0);
    return { ...category, spent };
  });

  // Get top spending categories for chart
  const chartCategories = [...categoriesWithSpent]
    .filter(cat => cat.spent > 0) // Only show categories with spending
    .sort((a, b) => b.spent - a.spent) // Sort by spent amount (highest first)
    .slice(0, 8); // Show top 8 spending categories (increased for better coverage)

  // Handle edge cases
  const hasSpendingData = chartCategories.length > 0;
  const hasMultipleCategories = chartCategories.length > 1;

  const chartData = chartCategories.map((cat) => ({
    name: cat.name,
    spent: Number(cat.spent) || 0,
    budgeted: Number(cat.budgeted) || 0,
    overBudget: (Number(cat.spent) || 0) > (Number(cat.budgeted) || 0),
  })).filter(item => item.budgeted > 0 || item.spent > 0); // Only show items with data







  const handleExportToExcel = () => {
    try {
      // Create workbook
      const wb = utils.book_new();

      // Create Budget Summary worksheet
      const summaryData = [
        ["Budget Summary", ""],
        ["Total Budgeted", budget.totalBudgeted],
        ["Total Spent", totalSpent],
        ["Remaining", budget.totalBudgeted - totalSpent],
        [],
        ["Category", "Budgeted", "Spent", "Remaining"],
      ];

      categoriesWithSpent.forEach((category) => {
        summaryData.push([
          category.name,
          category.budgeted,
          category.spent,
          category.budgeted - category.spent,
        ]);
      });

      const summaryWs = utils.aoa_to_sheet(summaryData);

      // Create Expenses worksheet
      const expensesData = [
        ["Transactions", "", "", ""],
        ["Date", "Category", "Description", "Amount", "Type"],
      ];

      expenses.forEach((expense) => {
        const category = categories.find(
          (c) => c._id === expense.categoryId || c.id === expense.categoryId
        );
        expensesData.push([
          new Date(expense.date).toLocaleDateString(),
          category?.name || "Unknown",
          expense.description || "-",
          String(expense.amount),
          expense.type,
        ]);
      });

      const expensesWs = utils.aoa_to_sheet(expensesData);

      // Add worksheets to workbook
      utils.book_append_sheet(wb, summaryWs, "Budget Summary");
      utils.book_append_sheet(wb, expensesWs, "Transactions");

      // Generate Excel file
      writeFile(wb, "budget-report.xlsx");
      toast.success("Excel report exported successfully");
    } catch (error) {
      console.error("Excel export failed:", error);
      toast.error("Failed to export Excel report");
    }
  };

  return (
    <Card className="glass-card hover-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Budget Summary
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Overview of your budget and top spending categories
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Excel</span>
              <span className="sm:hidden">XLS</span>
            </Button>

          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="p-3 sm:p-4 rounded-xl bg-secondary/50 backdrop-blur text-center">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">
              Total Budgeted
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-semibold">
              {formatMoney(calculatedTotalBudgeted)}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-primary/5 backdrop-blur text-center">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">
              Total Spent
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-semibold">
              {formatMoney(totalSpent)}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-secondary/50 backdrop-blur text-center sm:col-span-2 lg:col-span-1">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">
              Remaining
            </div>
            <div
              className={`text-lg sm:text-xl md:text-2xl font-semibold ${
                calculatedTotalBudgeted - totalSpent < 0
                  ? "text-destructive"
                  : ""
              }`}
            >
              {formatMoney(calculatedTotalBudgeted - totalSpent)}
            </div>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-medium mb-4 sm:mb-6">
              {hasSpendingData 
                ? `Top ${Math.min(chartCategories.length, 8)} Spending Categories`
                : "Top Spending Categories"
              }
            </h3>
            <div className="h-[250px] sm:h-[300px] md:h-[350px] flex flex-col" data-testid="summary-chart">
              {hasSpendingData ? (
                <div className="flex-1 overflow-x-auto">
                  <div className="min-w-full h-full" style={{ minWidth: `${Math.max(chartCategories.length * 120, 400)}px` }}>
                    <SpendingChart 
                      data={chartCategories.map(cat => ({
                        name: cat.name,
                        spent: cat.spent,
                        budgeted: cat.budgeted,
                        overBudget: cat.spent > cat.budgeted,
                      }))}
                      showBudgeted={false}
                      showLegend={false}
                      height="100%"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {categories.length === 0 
                        ? "No categories available" 
                        : "No spending data available"
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {categories.length === 0 
                        ? "Add budget categories to see spending data" 
                        : "Add expenses to see spending patterns"
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 px-4 rounded-lg bg-muted/30">
            <p className="text-sm sm:text-base text-muted-foreground">
              Add some budget categories to see a summary
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Summary;
