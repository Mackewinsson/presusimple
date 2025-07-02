"use client";

import { useState } from "react";
import { useAppDispatch } from "@/lib/hooks/useAppDispatch";
import { useAppSelector } from "@/lib/hooks/useAppSelector";
import { resetBudget } from "@/lib/store/budgetSlice";
import { clearExpenses } from "@/lib/store/expenseSlice";
import { saveBudget } from "@/lib/store/monthlyBudgetSlice";
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

const ResetButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const [monthName, setMonthName] = useState(() =>
    format(new Date(), "MMMM yyyy")
  );

  const { sections, categories, totalBudgeted, totalSpent } = useAppSelector(
    (state) => state.budget
  );
  const expenses = useAppSelector((state) => state.expenses.expenses);

  const handleReset = () => {
    // Save current month's data
    dispatch(
      saveBudget({
        name: monthName,
        sections,
        categories,
        expenses,
        totalBudgeted,
        totalSpent,
      })
    );

    // Reset spending but keep categories
    dispatch(resetBudget());
    dispatch(clearExpenses());

    toast.success("Current month saved and reset for a new month");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center justify-center text-destructive border-destructive/30 hover:bg-destructive/10 text-sm sm:text-base"
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
          <AlertDialogAction
            onClick={handleReset}
            className="text-sm sm:text-base"
          >
            Save and Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetButton;
