"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/useAppSelector";
import { addCategory } from "@/lib/store/budgetSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/utils/formatMoney";

interface NewCategoryFormProps {
  sectionId: string;
  onComplete: () => void;
}

const NewCategoryForm: React.FC<NewCategoryFormProps> = ({
  sectionId,
  onComplete,
}) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [budgeted, setBudgeted] = useState("");

  const totalAvailable = useAppSelector((state) => state.budget.totalAvailable);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() === "" || budgeted === "") {
      toast.error("Please fill in all required fields");
      return;
    }

    const budgetAmount = parseFloat(budgeted);

    if (isNaN(budgetAmount) || budgetAmount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (budgetAmount > totalAvailable) {
      toast.error(
        `Cannot budget more than available amount (${formatMoney(
          totalAvailable
        )})`
      );
      return;
    }

    dispatch(
      addCategory({
        name: name.trim(),
        budgeted: budgetAmount,
        sectionId,
      })
    );

    setName("");
    setBudgeted("");
    onComplete();

    toast.success("Category added successfully");
  };

  return (
    <Card className="w-full p-3 border">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-3">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name (e.g., Rent, Groceries)"
            className="w-full h-9 sm:h-8 text-sm sm:text-base"
            autoFocus
          />

          <div className="relative">
            <Input
              type="number"
              value={budgeted}
              onChange={(e) => setBudgeted(e.target.value)}
              placeholder="Budget amount"
              min="0"
              max={totalAvailable}
              step="0.01"
              className="w-full h-9 sm:h-8 text-sm sm:text-base"
            />
            <div className="absolute right-0 top-0 h-9 sm:h-8 px-2 flex items-center text-xs sm:text-sm text-muted-foreground pointer-events-none">
              Available: {formatMoney(totalAvailable)}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="h-9 sm:h-8 text-sm sm:text-base"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={name.trim() === "" || budgeted === ""}
            className="h-9 sm:h-8 text-sm sm:text-base"
          >
            Add
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default NewCategoryForm;
