"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/utils/formatMoney";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  PieChart,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useMonthlyBudgets, useUserId } from "@/lib/hooks";

export default function InsightsPage() {
  const { data: userId } = useUserId();
  const { data: budgets = [] } = useMonthlyBudgets(userId || "");
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>(
    budgets[0]?._id || ""
  );

  const selectedBudget = budgets.find((b) => b._id === selectedBudgetId);

  // Prepare data for category comparison chart
  const categoryData =
    selectedBudget?.categories.map((category) => ({
      name: category.name,
      budgeted: category.budgeted,
      spent: category.spent,
      overBudget: category.spent > category.budgeted,
    })) || [];

  // For now, we don't have expenses in the monthly budget data
  // This will be implemented when we add expenses to the monthly budget model
  const incomeTotal = 0;
  const expenseTotal = 0;

  // Get top spending categories
  const topCategories = [...(selectedBudget?.categories || [])]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/history"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to History
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">Budget Insights</h1>
            </div>

            <Select
              value={selectedBudgetId}
              onValueChange={setSelectedBudgetId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a month" />
              </SelectTrigger>
              <SelectContent>
                {budgets.map((budget) => (
                  <SelectItem key={budget._id} value={budget._id}>
                    {budget.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {selectedBudget ? (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Budget Overview
                  </CardTitle>
                  <CardDescription>
                    {format(parseISO(selectedBudget.createdAt), "MMMM yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Budgeted
                      </span>
                      <span className="font-medium">
                        {formatMoney(selectedBudget.totalBudgeted)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Spent</span>
                      <span className="font-medium">
                        {formatMoney(selectedBudget.totalSpent)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Difference</span>
                      <span
                        className={`font-medium ${
                          selectedBudget.totalBudgeted -
                            selectedBudget.totalSpent >=
                          0
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      >
                        {formatMoney(
                          selectedBudget.totalBudgeted -
                            selectedBudget.totalSpent
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDownCircle className="h-5 w-5 text-primary" />
                    Income
                  </CardTitle>
                  <CardDescription>Total income for the month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {formatMoney(incomeTotal)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Income data will be available soon
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpCircle className="h-5 w-5 text-destructive" />
                    Expenses
                  </CardTitle>
                  <CardDescription>
                    Total expenses for the month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">
                    {formatMoney(expenseTotal)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Expense data will be available soon
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Spending Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Category Spending
                </CardTitle>
                <CardDescription>
                  Comparison of budgeted vs actual spending by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 30,
                      }}
                      barGap={8}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--muted-foreground)/0.2)"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        height={60}
                        textAnchor="middle"
                      />
                      <YAxis
                        tickFormatter={(value) => formatMoney(value)}
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                      />
                      <Bar
                        dataKey="budgeted"
                        fill="hsl(var(--muted))"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="spent"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.overBudget
                                ? "hsl(var(--destructive))"
                                : "hsl(var(--primary))"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
                <CardDescription>
                  Categories where you spent the most
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span
                          className={
                            category.spent > category.budgeted
                              ? "text-destructive"
                              : ""
                          }
                        >
                          {formatMoney(category.spent)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            category.spent > category.budgeted
                              ? "bg-destructive"
                              : "bg-primary"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (category.spent / category.budgeted) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Budgeted: {formatMoney(category.budgeted)}</span>
                        <span>
                          {Math.round(
                            (category.spent / category.budgeted) * 100
                          )}
                          % spent
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No budget history available. Save a month to see insights.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
