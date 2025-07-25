"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { formatMoney } from "@/lib/utils/formatMoney";
import { Input } from "@/components/ui/input";
import InlineEdit from "@/components/ui/inline-edit";

import { toast } from "sonner";

interface BudgetCategoryItemProps {
  category: any;
  onRemove: (categoryId: string) => void;
  onUpdate: (categoryId: string, name: string, budgeted: number) => void;
  totalAvailable: number;
}

const BudgetCategoryItem: React.FC<BudgetCategoryItemProps> = ({
  category,
  onRemove,
  onUpdate,
  totalAvailable,
}) => {
  const [budgeted, setBudgeted] = useState(category.budgeted.toString());

  const handleRemoveCategory = () => {
    onRemove(category._id || category.id);
    toast.success("Category removed");
  };

  const handleSaveBudgetEdit = () => {
    const budgetAmount = parseFloat(budgeted);
    if (isNaN(budgetAmount) || budgetAmount < 0) {
      toast.error("Budgeted amount cannot be negative");
      return;
    }
    const budgetDiff = budgetAmount - category.budgeted;
    if (budgetDiff > totalAvailable) {
      toast.error(
        `Cannot increase budget by more than available amount (${formatMoney(
          totalAvailable
        )})`
      );
      return;
    }
    onUpdate(category._id || category.id, category.name, budgetAmount);
    toast.success("Category updated");
  };

  const getProgressColor = () => {
    const percentage = (category.spent / category.budgeted) * 100;
    if (percentage >= 100) return "danger";
    if (percentage >= 80) return "warning";
    return "success";
  };

  return (
    <Card className="border hover-card bg-card/50">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <InlineEdit
              value={category.name}
              onSave={(newName: string) => {
                onUpdate(category._id || category.id, newName, category.budgeted);
              }}
              onDelete={handleRemoveCategory}
              className="flex-1"
              buttonClassName="h-8 w-8 p-0"
              showDelete={true}
            />
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">
              {formatMoney(category.spent)} of{" "}
              {formatMoney(category.budgeted)}
            </span>
            <span
              className={
                category.spent > category.budgeted
                  ? "text-destructive font-medium"
                  : category.spent / category.budgeted > 0.8
                  ? "text-amber-500 font-medium"
                  : "text-muted-foreground"
              }
            >
              {category.spent >= category.budgeted
                ? `${((category.spent / category.budgeted - 1) * 100).toFixed(
                    0
                  )}% over`
                : `${((category.spent / category.budgeted) * 100).toFixed(
                    0
                  )}%`}
            </span>
          </div>
          <div className="budget-progress">
            <div
              className={`budget-progress-bar ${getProgressColor()}`}
              style={{
                width: `${Math.min(
                  100,
                  (category.spent / category.budgeted) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetCategoryItem;
