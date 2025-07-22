"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Trash2,
} from "lucide-react";
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
import { useMonthlyBudgets, useUserId, useDeleteMonthlyBudget } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BudgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const budgetId = params.id as string;
  
  const { data: userId } = useUserId();
  const { data: budgets = [], isLoading: budgetsLoading } = useMonthlyBudgets(
    userId || ""
  );
  const deleteBudgetMutation = useDeleteMonthlyBudget();

  const selectedBudget = budgets.find((b) => b._id === budgetId);

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteBudgetMutation.mutateAsync(budgetId);
      router.push("/history");
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  // Prepare data for category comparison chart
  const categoryData = selectedBudget?.categories.map((category) => ({
    name: category.name,
    budgeted: category.budgeted,
    spent: category.spent,
    overBudget: category.spent > category.budgeted,
  })) || [];

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

  if (budgetsLoading) {
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
                <h1 className="text-xl sm:text-2xl font-bold">Budget Details</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!selectedBudget) {
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
                <h1 className="text-xl sm:text-2xl font-bold">Budget Details</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Budget not found. It may have been deleted.
            </p>
            <Button onClick={() => router.push("/history")} className="mt-4">
              Back to History
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
              <h1 className="text-xl sm:text-2xl font-bold">Budget Details</h1>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this budget? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
                  {selectedBudget.name}
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
                  Transactions
                </CardTitle>
                <CardDescription>Total transactions for the month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {selectedBudget.expensesCount}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Transactions recorded
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5 text-destructive" />
                  Categories
                </CardTitle>
                <CardDescription>
                  Budget categories used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">
                  {selectedBudget.categories.length}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Categories tracked
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

          {/* Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                Detailed breakdown of each category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedBudget.categories.map((category, index) => (
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
      </main>
    </div>
  );
} 