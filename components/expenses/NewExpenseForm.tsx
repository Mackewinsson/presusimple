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
import { LoadingButton } from "@/components/ui/loading-skeleton";

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
      toast.error("Please fill in all required fields");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!userId) {
      toast.error("You must be signed in to add transactions");
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
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
          <Label htmlFor="type">Type</Label>
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
                    Expense
                  </span>
                </div>
              </SelectItem>
              <SelectItem
                value="income"
                className="[&>span]:text-green-600 [&>span]:dark:text-green-400"
              >
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400">
                    Income
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          type="text"
          placeholder="What was this transaction for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
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
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <LoadingButton
        type="submit"
        className="w-full"
        loading={createExpenseMutation.isPending}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Transaction
      </LoadingButton>
    </form>
  );
};

export default NewExpenseForm;
