"use client";

import React, { useState } from "react";
import { formatMoney, parseDecimalInput } from "@/lib/utils/formatMoney";
import { useCurrentCurrency, useCurrentDecimalSeparator } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit2,
  Save,
  Trash2,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
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
import { useUpdateExpense, useDeleteExpense } from "@/lib/hooks";

interface Category {
  _id?: string;
  id?: string;
  name: string;
  budgeted: number;
  spent: number;
  budgetId: string;
}

interface Expense {
  _id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  type: "expense" | "income";
}

type TransactionType = "expense" | "income";

interface ExpenseItemProps {
  expense: Expense;
  categories: Category[];
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, categories }) => {
  const { t } = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const decimalSeparator = useCurrentDecimalSeparator();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const [isEditing, setIsEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState(expense.amount.toString());
  const [editedDescription, setEditedDescription] = useState(
    expense.description
  );
  const [editedCategoryId, setEditedCategoryId] = useState(expense.categoryId);
  const [editedDate, setEditedDate] = useState(expense.date);
  const [editedType, setEditedType] = useState<TransactionType>(expense.type);

  const category = categories.find(
    (cat) => cat._id === expense.categoryId || cat.id === expense.categoryId
  );

  const handleRemoveExpense = async () => {
    try {
      await deleteExpenseMutation.mutateAsync(expense._id);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleSaveEdit = async () => {
    const newAmount = parseDecimalInput(editedAmount);

    if (newAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await updateExpenseMutation.mutateAsync({
        id: expense._id,
        updates: {
          amount: newAmount,
          description: editedDescription.trim(),
          categoryId: editedCategoryId,
          date: editedDate,
          type: editedType,
        },
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditedAmount(expense.amount.toString());
    setEditedDescription(expense.description);
    setEditedCategoryId(expense.categoryId);
    setEditedDate(expense.date);
    setEditedType(expense.type);
    setIsEditing(false);
  };

  const formattedDate = format(new Date(expense.date), "MMM dd, yyyy");

  if (isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('amount')}</label>
              <Input
                type="number"
                value={editedAmount}
                onChange={(e) => setEditedAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('type')}</label>
              <Select
                value={editedType}
                onValueChange={(value: TransactionType) => setEditedType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">{t('expense')}</SelectItem>
                  <SelectItem value="income">{t('income')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('description')}</label>
            <Input
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('category')}</label>
              <Select
                value={editedCategoryId}
                onValueChange={setEditedCategoryId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category._id || category.id}
                      value={category._id || category.id || ""}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('date')}</label>
              <Input
                type="date"
                value={editedDate}
                onChange={(e) => setEditedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveEdit} size="sm">
              <Save className="h-4 w-4 mr-1" />
              {t('save')}
            </Button>
            <Button onClick={handleCancelEdit} variant="outline" size="sm">
              <X className="h-4 w-4 mr-1" />
              {t('cancel')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="font-medium">
            {expense.description ||
              `${expense.type === "expense" ? t('expense') : t('income')} ${t('for')} ${
                category?.name || t('unknown')
              }`}
          </div>
          <div className="text-sm text-muted-foreground">
            {category?.name || t('unknown')} • {formattedDate}
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <div className="text-right">
            <div
              className={`font-medium flex items-center gap-1 ${
                expense.type === "expense"
                  ? "text-destructive"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {expense.type === "expense" ? (
                <ArrowUpCircle className="h-4 w-4 text-destructive" />
              ) : (
                <ArrowDownCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
                                {formatMoney(expense.amount, currentCurrency, decimalSeparator)}
            </div>
          </div>
          <div className="flex items-center gap-1">
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
                <AlertDialogTitle>{t('deleteTransaction')}</AlertDialogTitle>
                <AlertDialogDescription>
                    {t('areYouSureDeleteTransaction')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveExpense}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;
