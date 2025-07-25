"use client";

import { useState } from "react";
import ExpenseItem from "./ExpenseItem";
import {
  compareDesc,
  isWithinInterval,
  startOfDay,
  endOfDay,
  parseISO,
} from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";

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

interface ExpenseListProps {
  categories: Category[];
  expenses: Expense[];
}

const ExpenseList: React.FC<ExpenseListProps> = ({ categories, expenses }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  // Filter expenses based on search term and date range
  const filteredExpenses = sortedExpenses.filter((expense) => {
    const category = categories.find(
      (cat) => cat._id === expense.categoryId || cat.id === expense.categoryId
    );
    const searchLower = searchTerm.toLowerCase();

    // Text search
    const matchesSearch =
      expense.description.toLowerCase().includes(searchLower) ||
      category?.name.toLowerCase().includes(searchLower);

    // Date range filter
    let matchesDateRange = true;
    if (startDate && endDate) {
      const expenseDate = parseISO(expense.date);
      matchesDateRange = isWithinInterval(expenseDate, {
        start: startOfDay(parseISO(startDate)),
        end: endOfDay(parseISO(endDate)),
      });
    }

    return matchesSearch && matchesDateRange;
  });

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('noTransactionsYet')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredExpenses.map((expense) => (
          <ExpenseItem
            key={expense._id}
            expense={expense}
            categories={categories}
          />
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No transactions found matching your search.
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
