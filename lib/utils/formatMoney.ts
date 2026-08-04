import { Currency, currencies } from "@/lib/hooks/useCurrencyQueries";
import type { DecimalSeparator } from "@/lib/api";

const DEFAULT_CURRENCY: Currency = currencies[0];

/**
 * Format a number as a currency string.
 * Uses locale en-US for dot (1,234.56) or de-DE for comma (1.234,56).
 */
export const formatMoney = (
  amount: number,
  currency: Currency = DEFAULT_CURRENCY,
  decimalSeparator: DecimalSeparator = "dot"
): string => {
  const locale = decimalSeparator === "comma" ? "de-DE" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency?.code || DEFAULT_CURRENCY.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Masked placeholder for private mode — preserves currency symbol position.
 */
export const maskMoney = (
  currency: Currency = DEFAULT_CURRENCY,
  decimalSeparator: DecimalSeparator = "dot"
): string => {
  const locale = decimalSeparator === "comma" ? "de-DE" : "en-US";
  const decimalSep = decimalSeparator === "comma" ? "," : ".";
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency?.code || DEFAULT_CURRENCY.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(1234.56);

  let integerMasked = false;

  return parts
    .map((part) => {
      if (part.type === "currency" || part.type === "minusSign") {
        return part.value;
      }
      if (part.type === "literal") {
        return part.value;
      }
      if (part.type === "group") {
        return "";
      }
      if (part.type === "integer") {
        if (integerMasked) return "";
        integerMasked = true;
        return "••••";
      }
      if (part.type === "decimal") {
        return decimalSep;
      }
      if (part.type === "fraction") {
        return "••";
      }
      return "";
    })
    .join("");
};

export const maskPercent = (): string => "••%";

/**
 * Parse user-typed amount string (accepts both comma and dot as decimal separator).
 */
export const parseDecimalInput = (value: string): number => {
  const trimmed = (value ?? "").trim();
  if (trimmed === "") return 0;
  const normalized = trimmed.replace(",", ".");
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? 0 : num;
};

/**
 * Calculate the percentage of a value relative to a total
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
};

/**
 * Determine the status of a budget category based on spending
 */
export const getBudgetStatus = (
  spent: number,
  budgeted: number
): "success" | "warning" | "danger" => {
  const percentage = calculatePercentage(spent, budgeted);

  if (percentage >= 100) return "danger";
  if (percentage >= 80) return "warning";
  return "success";
};
