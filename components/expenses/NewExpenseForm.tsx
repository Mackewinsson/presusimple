"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useUserId, useCreateExpense } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";
import { parseDecimalInput } from "@/lib/utils/formatMoney";

interface Budget {
  _id: string;
  totalBudgeted: number;
  totalAvailable: number;
}

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

interface NewExpenseFormProps {
  budget: Budget;
  categories: Category[];
  expenses: Expense[];
}

const NewExpenseForm: React.FC<NewExpenseFormProps> = ({
  budget,
  categories,
  expenses,
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { data: userId } = useUserId();
  const createExpenseMutation = useCreateExpense();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [type, setType] = useState<TransactionType>("expense");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !description || !categoryId) {
      toast.error(t("fillAllFields"));
      return;
    }

    const numAmount = parseDecimalInput(amount);
    if (numAmount <= 0) {
      toast.error(t("enterValidAmount"));
      return;
    }

    if (!userId) {
      toast.error(t("mustBeSignedIn"));
      return;
    }

    try {
      await createExpenseMutation.mutateAsync({
        user: userId,
        budget: budget._id,
        categoryId,
        amount: numAmount,
        description: description.trim(),
        date,
        type,
      });

      // Reset form
      setAmount("");
      setDescription("");
      setCategoryId("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setType("expense");
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="expense-form">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden">
        <div className="space-y-2 min-w-0">
          <Label htmlFor="amount">{t('amount')}</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">{t('type')}</Label>
          <Select
            value={type}
            onValueChange={(value: TransactionType) => setType(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="expense"
                className="[&>span]:text-red-600 [&>span]:dark:text-red-400"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4 text-red-600 dark:text-red-400 !text-red-600 !dark:text-red-400" />
                  <span className="text-red-600 dark:text-red-400 !text-red-600 !dark:text-red-400">
                    {t('expense')}
                  </span>
                </div>
              </SelectItem>
              <SelectItem
                value="income"
                className="[&>span]:text-success"
              >
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4 text-success" />
                  <span className="text-success">
                    {t('income')}
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('description')}</Label>
        <Input
          id="description"
          type="text"
          placeholder={t('whatWasThisFor')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden">
        <div className="space-y-2 min-w-0">
          <Label htmlFor="category">{t('category')}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectACategory')} />
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

        <div className="space-y-2 min-w-0">
          <Label htmlFor="date">{t('date')}</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="min-w-0 max-w-full [&::-webkit-calendar-picker-indicator]:opacity-100"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full font-semibold shadow-md hover:shadow-lg transition-shadow accent-fill hover:bg-accent/90"
        disabled={createExpenseMutation.isPending}
      >
        {createExpenseMutation.isPending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
            {t('addTransaction')}
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            {t('addTransaction')}
          </>
        )}
      </Button>
    </form>
  );
};

export default NewExpenseForm;
