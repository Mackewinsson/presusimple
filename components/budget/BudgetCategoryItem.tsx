"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/utils/formatMoney";
import { Input } from "@/components/ui/input";
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
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [budgeted, setBudgeted] = useState(category.budgeted.toString());

  const handleRemoveCategory = () => {
    onRemove(category._id || category.id);
    toast.success("Category removed");
  };

  const handleSaveEdit = () => {
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
    onUpdate(category._id || category.id, name, budgetAmount);
    setIsEditing(false);
    toast.success("Category updated");
  };

  const handleCancelEdit = () => {
    setName(category.name);
    setBudgeted(category.budgeted.toString());
    setIsEditing(false);
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
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9"
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="number"
                  value={budgeted}
                  onChange={(e) => setBudgeted(e.target.value)}
                  className="h-9"
                  min="0"
                  step="0.01"
                  placeholder="Budget amount"
                />
                <div className="absolute right-0 top-0 h-9 px-3 flex items-center text-sm text-muted-foreground pointer-events-none">
                  Available: {formatMoney(totalAvailable)}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="h-8"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveEdit}
                className="h-8"
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">{category.name}</span>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Category</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this category? This will
                        remove the budgeted amount and any expenses assigned to
                        it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemoveCategory}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetCategoryItem;
