"use client";

import { cn } from "@/lib/utils";
import { useFormatMoney } from "@/lib/hooks/useFormatMoney";
import type { Currency } from "@/lib/hooks/useCurrencyQueries";
import type { DecimalSeparator } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

interface SensitiveAmountProps {
  amount: number;
  currency?: Currency;
  decimalSeparator?: DecimalSeparator;
  className?: string;
  as?: "span" | "p" | "div";
}

export function SensitiveAmount({
  amount,
  currency,
  decimalSeparator,
  className,
  as: Component = "span",
}: SensitiveAmountProps) {
  const { formatAmount, isPrivateMode } = useFormatMoney();
  const { t } = useTranslation();

  return (
    <Component
      className={cn(
        isPrivateMode && "sensitive-amount tabular-nums",
        className
      )}
      aria-label={isPrivateMode ? t("privateModeAmountHidden") : undefined}
    >
      {formatAmount(amount, currency, decimalSeparator)}
    </Component>
  );
}
