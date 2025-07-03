"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
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
import { format } from "date-fns";
import { useUserId, useResetBudget, useSaveMonthlyBudget } from "@/lib/hooks";
import { LoadingButton } from "@/components/ui/loading-skeleton";
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

interface ResetButtonProps {
  budget: Budget | null;
  categories: Category[];
  expenses: Expense[];
}

const ResetButton: React.FC<ResetButtonProps> = ({
  budget,
  categories,
  expenses,
}) => {
  const { data: userId } = useUserId();
  const resetBudgetMutation = useResetBudget();
  const saveMonthlyBudgetMutation = useSaveMonthlyBudget();

  const [monthName, setMonthName] = useState(() =>
    format(new Date(), "MMMM yyyy")
  );

  const handleReset = async () => {
    if (!budget || !userId) {
      toast.error("No budget found to reset");
      return;
    }

    try {
      // Calculate total spent from expenses
      const totalSpent = expenses.reduce((sum, expense) => {
        return (
          sum + (expense.type === "expense" ? expense.amount : -expense.amount)
        );
      }, 0);

      // Convert month number to month name
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthNameFromNumber = monthNames[budget.month - 1] || "Unknown";

      // First, save the current month's data
      await saveMonthlyBudgetMutation.mutateAsync({
        name: monthName,
        month: monthNameFromNumber,
        year: budget.year,
        categories: categories.map((cat) => ({
          name: cat.name,
          budgeted: cat.budgeted,
          spent: cat.spent,
        })),
        totalBudgeted: budget.totalBudgeted,
        totalSpent: totalSpent,
        expensesCount: expenses.length,
        userId,
      });

      // Then reset the budget (clear expenses and reset spent amounts)
      await resetBudgetMutation.mutateAsync(userId);

      toast.success("Current month saved and reset for a new month");
    } catch (error) {
      console.error("Error during reset:", error);
      toast.error("Failed to reset budget. Please try again.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center justify-center text-destructive border-destructive/30 hover:bg-destructive/10 text-sm sm:text-base"
          disabled={!budget}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Reset Month
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg sm:text-xl">
            Save and Reset Monthly Budget
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base">
            This will save your current month's data and reset all spending, but
            keep your budget categories and their assigned amounts.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="monthName" className="text-sm sm:text-base">
            Month Name
          </Label>
          <Input
            id="monthName"
            value={monthName}
            onChange={(e) => setMonthName(e.target.value)}
            placeholder="Enter a name for this month"
            className="text-sm sm:text-base"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="text-sm sm:text-base">
            Cancel
          </AlertDialogCancel>
          <LoadingButton
            onClick={handleReset}
            className="text-sm sm:text-base"
            loading={
              resetBudgetMutation.isPending ||
              saveMonthlyBudgetMutation.isPending
            }
          >
            Save and Reset
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetButton;
