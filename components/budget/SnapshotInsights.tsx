"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatMoney } from "@/lib/hooks/useFormatMoney";
import { useCurrentDecimalSeparator } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import {
  calculateSavingsRate,
  getOverspentCategories,
  type BudgetCategoryInput,
} from "@/lib/budget-chart-data";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

interface SnapshotInsightsProps {
  categories: BudgetCategoryInput[];
  totalBudgeted: number;
  totalSpent: number;
  previousTotalSpent?: number | null;
}

export function SnapshotInsights({
  categories,
  totalBudgeted,
  totalSpent,
  previousTotalSpent,
}: SnapshotInsightsProps) {
  const { t } = useTranslation();
  const { formatAmount, formatPercent, isPrivateMode } = useFormatMoney();
  const decimalSeparator = useCurrentDecimalSeparator();

  const savingsRate = calculateSavingsRate(totalBudgeted, totalSpent);
  const overspent = getOverspentCategories(categories);

  const spentDelta =
    previousTotalSpent != null ? totalSpent - previousTotalSpent : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("savingsRate")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              savingsRate != null && savingsRate >= 0
                ? "text-success"
                : "text-destructive"
            }`}
          >
            {savingsRate != null
              ? isPrivateMode
                ? formatPercent(totalBudgeted - totalSpent, totalBudgeted)
                : `${savingsRate.toFixed(1)}%`
              : "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className={cn(isPrivateMode && "sensitive-amount")}>
              {formatAmount(totalBudgeted - totalSpent, undefined, decimalSeparator)}
            </span>{" "}
            {t("remaining").toLowerCase()}
          </p>
        </CardContent>
      </Card>

      {spentDelta != null && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("vsPreviousMonth")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {spentDelta <= 0 ? (
                <TrendingDown className="h-5 w-5 text-success" />
              ) : (
                <TrendingUp className="h-5 w-5 text-destructive" />
              )}
              <span
                className={`text-2xl font-bold ${
                  spentDelta <= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {spentDelta <= 0 ? "" : "+"}
                <span className={cn(isPrivateMode && "sensitive-amount")}>
                  {formatAmount(spentDelta, undefined, decimalSeparator)}
                </span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("totalSpent")}:{" "}
              <span className={cn(isPrivateMode && "sensitive-amount")}>
                {formatAmount(totalSpent, undefined, decimalSeparator)}
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      <Card className={overspent.length > 0 ? "sm:col-span-2 lg:col-span-1" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {overspent.length > 0 && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            {t("overspentCategories")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overspent.length > 0 ? (
            <ul className="space-y-2">
              {overspent.slice(0, 3).map((cat) => (
                <li
                  key={cat.name}
                  className="flex justify-between text-sm gap-2"
                >
                  <span className="truncate">{cat.name}</span>
                  <span className={cn("text-destructive font-medium shrink-0", isPrivateMode && "sensitive-amount")}>
                    +{formatAmount(cat.overBy, undefined, decimalSeparator)}
                  </span>
                </li>
              ))}
              {overspent.length > 3 && (
                <li className="text-xs text-muted-foreground">
                  +{overspent.length - 3} more
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("noOverspentCategories")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
