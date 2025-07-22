"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/utils/formatMoney";
import { exportToPdf } from "@/lib/utils/exportToPdf";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
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

  // Get all categories for chart (show budgeted amounts even if no spending)
  const chartCategories = [...categoriesWithSpent]
    .sort((a, b) => b.budgeted - a.budgeted) // Sort by budgeted amount
    .slice(0, 5);

  const chartData = chartCategories.map((cat) => ({
    name: cat.name,
    spent: cat.spent,
    budgeted: cat.budgeted,
    overBudget: cat.spent > cat.budgeted,
  }));

  console.log('Chart rendering check:', { chartDataLength: chartData.length, chartData });

  // Debug logging
  console.log('Summary Debug:', {
    categoriesCount: categories.length,
    categoriesWithSpentCount: categoriesWithSpent.length,
    chartCategoriesCount: chartCategories.length,
    chartData,
    totalSpent,
    calculatedTotalBudgeted,
    budget: budget,
    expenses: expenses
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">
            Spent:{" "}
            <span className="font-medium text-foreground">
              {formatMoney(data.spent)}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Budgeted:{" "}
            <span className="font-medium text-foreground">
              {formatMoney(data.budgeted)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    // Fallbacks for undefined values
    const labelX = x + (width ? width / 2 : 0);
    // If the bar is zero, y may be at the bottom of the chart, so lift it up a bit
    const labelY = (y !== undefined ? y : 0) - 8;
    // Optionally, skip label for zero values
    if (!value) return null;
    return (
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        fontSize={12}
        fill="hsl(var(--muted-foreground))"
        fontWeight={500}
        pointerEvents="none"
      >
        {formatMoney(value)}
      </text>
    );
  };

  const handleExportToPdf = () => {
    try {
      // Create sections array for PDF export (since we don't have sections in MongoDB)
      const sections = [{ id: "default", name: "Budget Categories" }];

      // Convert MongoDB categories to the format expected by exportToPdf
      const convertedCategories = categories.map((cat) => ({
        id: cat._id || cat.id || "",
        name: cat.name,
        budgeted: cat.budgeted,
        spent: cat.spent,
        sectionId: cat.sectionId,
      }));

      // Convert MongoDB expenses to the format expected by exportToPdf
      const convertedExpenses = expenses.map((expense) => ({
        _id: expense._id,
        categoryId: expense.categoryId,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        type: expense.type,
      }));

      exportToPdf(
        sections,
        convertedCategories,
        convertedExpenses,
        budget.totalBudgeted,
        totalSpent
      );
      toast.success("PDF report generated successfully");
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Failed to generate PDF report");
    }
  };

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
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToPdf}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              PDF
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
              Top Spending Categories
            </h3>
            <div className="h-[250px] sm:h-[300px] md:h-[350px]" data-testid="summary-chart">
              {chartData.length > 0 ? (
                <div>
                  <div style={{ height: '20px', background: 'red', marginBottom: '10px' }}>
                    Chart Debug: {chartData.length} items
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 10,
                        bottom: 40,
                      }}
                      barGap={6}
                    >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--muted-foreground)/0.2)"
                      horizontal={true}
                    />
                    <XAxis
                      dataKey="name"
                      angle={-35}
                      textAnchor="end"
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                        dy: 10,
                      }}
                      tickFormatter={(name) =>
                        name.length > 12 ? name.slice(0, 12) + "…" : name
                      }
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      height={80}
                      type="category"
                      scale="band"
                    />
                    <YAxis
                      tickFormatter={(value) => formatMoney(value)}
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 10,
                      }}
                      tickLine={false}
                      axisLine={false}
                      width={70}
                      type="number"
                      scale="linear"
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                      active={true}
                      isAnimationActive={true}
                    />
                    <Bar
                      dataKey="budgeted"
                      fill="hsl(var(--muted))"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                      type="monotone"
                    />
                    <Bar dataKey="spent" radius={[4, 4, 0, 0]} maxBarSize={30} type="monotone">
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.overBudget
                              ? "hsl(var(--destructive))"
                              : "hsl(var(--primary))"
                          }
                        />
                      ))}
                      <LabelList dataKey="spent" content={CustomBarLabel} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">
                    No chart data available
                  </p>
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
