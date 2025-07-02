"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/useAppSelector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import BudgetSectionItem from "./BudgetSectionItem";
import NewSectionForm from "./NewSectionForm";
import { formatMoney } from "@/lib/utils/formatMoney";
import { setTotalAvailable } from "@/lib/store/budgetSlice";
import { toast } from "sonner";

const BudgetSetupSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [totalBudget, setTotalBudget] = useState("");

  const { sections, totalBudgeted, totalAvailable } = useAppSelector(
    (state) => state.budget
  );
  const currency = useAppSelector((state) => state.currency.selected);

  const handleSetTotalBudget = () => {
    const amount = parseFloat(totalBudget);

    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < totalBudgeted) {
      toast.error("New total cannot be less than currently budgeted amount");
      return;
    }

    dispatch(setTotalAvailable(amount - totalBudgeted));
    setIsEditingTotal(false);
    setTotalBudget("");
    toast.success("Total budget updated");
  };

  return (
    <Card className="glass-card hover-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Budget Setup
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-slate-700 dark:text-white/70">
              Create budget sections and categories to track your spending
            </CardDescription>
          </div>
          <div className="text-right">
            {isEditingTotal ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder="Total budget"
                    className="w-full sm:w-40 pl-9"
                    min={totalBudgeted}
                    step="0.01"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSetTotalBudget}
                    className="flex-1 sm:flex-none"
                  >
                    Set
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingTotal(false)}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingTotal(true)}
                className="p-3 rounded-lg bg-slate-900/10 dark:bg-white/10 hover:bg-slate-900/20 dark:hover:bg-white/20 transition-all duration-200 cursor-pointer border border-slate-900/20 dark:border-white/20"
              >
                <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-white">
                  {formatMoney(totalBudgeted + totalAvailable, currency)}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-white/60">
                  Total Budget (click to edit)
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/10 dark:bg-white/10 backdrop-blur-sm border border-slate-900/20 dark:border-white/20">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-white/60">
              Budgeted
            </div>
            <div className="text-base sm:text-lg font-medium mt-1 text-slate-900 dark:text-white">
              {formatMoney(totalBudgeted, currency)}
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/10 dark:bg-white/10 backdrop-blur-sm border border-slate-900/20 dark:border-white/20">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-white/60">
              Available to Budget
            </div>
            <div className="text-base sm:text-lg font-medium mt-1 text-slate-900 dark:text-white">
              {formatMoney(totalAvailable, currency)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {sections.length > 0 ? (
            <div className="space-y-4">
              {sections.map((section) => (
                <BudgetSectionItem key={section.id} section={section} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4 rounded-lg bg-slate-900/5 dark:bg-white/5 backdrop-blur-sm border border-slate-900/10 dark:border-white/10">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/20 dark:bg-white/20 mb-3 sm:mb-4">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900 dark:text-white" />
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-white/70">
                No budget sections yet. Add one to get started.
              </p>
            </div>
          )}

          {isAddingSection ? (
            <NewSectionForm onComplete={() => setIsAddingSection(false)} />
          ) : (
            <Button
              onClick={() => setIsAddingSection(true)}
              className="w-full mt-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Budget Section
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetSetupSection;
