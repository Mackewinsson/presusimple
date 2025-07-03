"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelectedCurrency, useSetCurrency, currencies } from "@/lib/hooks";

export default function CurrencySelector() {
  const { data: selectedCurrency } = useSelectedCurrency();
  const setCurrencyMutation = useSetCurrency();

  const handleCurrencyChange = (code: string) => {
    const currency = currencies.find((c) => c.code === code);
    if (currency) {
      setCurrencyMutation.mutate(currency);
    }
  };

  return (
    <Select
      value={selectedCurrency?.code || "USD"}
      onValueChange={handleCurrencyChange}
    >
      <SelectTrigger className="w-[100px] sm:w-[130px] text-sm sm:text-base">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-2">
              <span>{currency.symbol}</span>
              <span>{currency.code}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
