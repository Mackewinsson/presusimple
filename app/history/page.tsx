"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/useAppSelector";
import { deleteBudget } from "@/lib/store/monthlyBudgetSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils/formatMoney";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Search, Trash2, TrendingUp } from "lucide-react";
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
import { toast } from "sonner";

export default function HistoryPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const budgets = useAppSelector((state) => state.monthlyBudgets.budgets);

  const sortedBudgets = [...budgets].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );

  const filteredBudgets = sortedBudgets.filter((budget) =>
    budget.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    dispatch(deleteBudget({ id }));
    toast.success("Budget history deleted");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <header className="border-b bg-card/90 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/app"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Budget
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">Budget History</h1>
            </div>

            <Link href="/history/insights">
              <Button variant="outline" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                View Insights
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search budget history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredBudgets.length > 0 ? (
            <div className="grid gap-4">
              {filteredBudgets.map((budget) => (
                <Card key={budget.id} className="glass-card hover-card">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{budget.name}</CardTitle>
                        <CardDescription>
                          {format(parseISO(budget.date), "PPP")}
                        </CardDescription>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg sm:text-xl">
                              Delete Budget History
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm sm:text-base">
                              Are you sure you want to delete this budget
                              history? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-sm sm:text-base">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(budget.id)}
                              className="text-sm sm:text-base"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Total Budgeted
                        </div>
                        <div className="font-medium">
                          {formatMoney(budget.totalBudgeted)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Total Spent
                        </div>
                        <div className="font-medium">
                          {formatMoney(budget.totalSpent)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Categories
                        </div>
                        <div className="font-medium">
                          {budget.categories.length}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Transactions
                        </div>
                        <div className="font-medium">
                          {budget.expenses.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-lg bg-card/95 backdrop-blur shadow-lg">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No budgets found matching your search."
                  : "No budget history yet."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
