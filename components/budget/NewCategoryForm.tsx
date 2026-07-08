"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { toast } from "sonner";
import { formatMoney, parseDecimalInput } from "@/lib/utils/formatMoney";
import { useTranslation } from "@/lib/i18n";
import { useCurrentCurrency, useCurrentDecimalSeparator } from "@/lib/hooks";
import { hasDuplicateName } from "@/lib/utils/normalizeName";

interface NewCategoryFormProps {
  onComplete: (name: string, budgeted: number) => void;
  onCancel: () => void;
  totalAvailable: number;
  existingCategoryNames: string[];
}

const NewCategoryForm: React.FC<NewCategoryFormProps> = ({
  onComplete,
  onCancel,
  totalAvailable,
  existingCategoryNames,
}) => {
  const { t } = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const decimalSeparator = useCurrentDecimalSeparator();
  const [name, setName] = useState("");
  const [budgeted, setBudgeted] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() === "" || budgeted === "") {
      toast.error(t("fillAllFields"));
      return;
    }

    if (hasDuplicateName(name.trim(), existingCategoryNames)) {
      toast.error(t("categoryNameAlreadyExists"));
      return;
    }

    const budgetAmount = parseDecimalInput(budgeted);

    if (budgetAmount <= 0) {
      toast.error(t("enterValidAmount"));
      return;
    }

    if (budgetAmount > totalAvailable) {
      toast.error(
        `${t("cannotBudgetMoreThanAvailable")} (${formatMoney(
          totalAvailable,
          currentCurrency,
          decimalSeparator
        )})`
      );
      return;
    }

    setName("");
    setBudgeted("");
    onComplete(name.trim(), budgetAmount);

    toast.success(t("categoryCreatedSuccess"));
  };

  return (
    <Card className="w-full p-3 border">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-3">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("categoryNamePlaceholder")}
            className="w-full h-9 sm:h-8 text-sm sm:text-base"
            autoFocus
          />

          <div className="relative">
            <Input
              type="number"
              value={budgeted}
              onChange={(e) => setBudgeted(e.target.value)}
              placeholder={t("budgetAmountPlaceholder")}
              min="0"
              max={totalAvailable}
              step="0.01"
              className="w-full h-9 sm:h-8 text-sm sm:text-base"
            />
            <div className="absolute right-0 top-0 h-9 sm:h-8 px-2 flex items-center text-xs sm:text-sm text-muted-foreground pointer-events-none">
              {t("availableLabel")}: {formatMoney(totalAvailable, currentCurrency, decimalSeparator)}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-9 sm:h-8 text-sm sm:text-base"
          >
            <X className="h-4 w-4 mr-1" />
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={name.trim() === "" || budgeted === ""}
            className="h-9 sm:h-8 text-sm sm:text-base"
          >
            {t('add')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default NewCategoryForm;
