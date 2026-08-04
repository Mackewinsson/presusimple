"use client";

import { useCallback } from "react";
import { usePrivateMode } from "@/components/PrivateModeProvider";
import type { Currency } from "@/lib/hooks/useCurrencyQueries";
import type { DecimalSeparator } from "@/lib/api";
import {
  formatMoney,
  maskMoney,
  maskPercent,
} from "@/lib/utils/formatMoney";
import {
  useCurrentCurrency,
  useCurrentDecimalSeparator,
} from "@/lib/hooks";

export function useFormatMoney() {
  const { isPrivateMode } = usePrivateMode();
  const currency = useCurrentCurrency();
  const decimalSeparator = useCurrentDecimalSeparator();

  const formatAmount = useCallback(
    (
      amount: number,
      currencyOverride?: Currency,
      decimalSeparatorOverride?: DecimalSeparator
    ) => {
      const resolvedCurrency = currencyOverride ?? currency;
      const resolvedSeparator = decimalSeparatorOverride ?? decimalSeparator;

      if (isPrivateMode) {
        return maskMoney(resolvedCurrency, resolvedSeparator);
      }

      return formatMoney(amount, resolvedCurrency, resolvedSeparator);
    },
    [currency, decimalSeparator, isPrivateMode]
  );

  const formatPercent = useCallback(
    (value: number, total: number) => {
      if (isPrivateMode) {
        return maskPercent();
      }
      if (total === 0) return "0%";
      return `${Math.min(100, Math.round((value / total) * 100))}%`;
    },
    [isPrivateMode]
  );

  return { formatAmount, formatPercent, isPrivateMode };
}
