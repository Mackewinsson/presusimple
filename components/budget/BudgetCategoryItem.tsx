"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils/formatMoney";
import { useCurrentCurrency } from "@/lib/hooks";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
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
  const { t } = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editBudgeted, setEditBudgeted] = useState(category.budgeted.toString());

  const handleRemoveCategory = () => {
    onRemove(category._id || category.id);
    toast.success(t("categoryRemoved"));
  };

  const handleStartEdit = () => {
    setEditName(category.name);
    setEditBudgeted(category.budgeted.toString());
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedName = editName.trim();
    const budgetAmount = parseFloat(editBudgeted);
    
    if (trimmedName === "") {
      toast.error(t("pleaseEnterCategoryName"));
      return;
    }

    if (isNaN(budgetAmount) || budgetAmount < 0) {
      toast.error(t("budgetedAmountCannotBeNegative"));
      return;
    }

    const budgetDiff = budgetAmount - category.budgeted;
    if (budgetDiff > totalAvailable) {
      toast.error(
        `${t('cannotIncreaseBudgetByMore')} (${formatMoney(
          totalAvailable,
          currentCurrency
        )})`
      );
      return;
    }

    onUpdate(category._id || category.id, trimmedName, budgetAmount);
    setIsEditing(false);
    toast.success(t("categoryUpdated"));
  };

  const handleCancel = () => {
    setEditName(category.name);
    setEditBudgeted(category.budgeted.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
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
            {isEditing ? (
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 text-sm"
                    placeholder={t("categoryName")}
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={editBudgeted}
                      onChange={(e) => setEditBudgeted(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="pl-9 text-sm"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleSave}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="font-medium">{category.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEdit}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-lg sm:text-xl">
                        {t('deleteCategory')}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm sm:text-base">
                        {t('areYouSureDeleteCategory')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-sm sm:text-base">
                        {t('cancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRemoveCategory}
                        className="text-sm sm:text-base"
                      >
                        {t('delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">
              {formatMoney(category.spent, currentCurrency)} of{" "}
              {formatMoney(category.budgeted, currentCurrency)}
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
                  )}% ${t('over')}`
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
