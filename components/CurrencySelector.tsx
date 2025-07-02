"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/useAppSelector";
import { setCurrency, currencies, Currency } from "@/lib/store/currencySlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CurrencySelector() {
  const dispatch = useAppDispatch();
  const selectedCurrency = useAppSelector((state) => state.currency.selected);

  const handleCurrencyChange = (code: string) => {
    const currency = currencies.find((c) => c.code === code) as Currency;
    dispatch(setCurrency(currency));
  };

  return (
    <Select value={selectedCurrency.code} onValueChange={handleCurrencyChange}>
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
