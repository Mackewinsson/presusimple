import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
];

export const useSelectedCurrency = () => {
  return useQuery({
    queryKey: ["selectedCurrency"],
    queryFn: async (): Promise<Currency> => {
      const response = await fetch("/api/users/currency");
      if (!response.ok) {
        // Fallback to USD if API fails
        return currencies[0];
      }
      const data = await response.json();
      const currency = currencies.find(c => c.code === data.currency) || currencies[0];
      return currency;
    },
  });
};

export const useSetCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currency: Currency) => {
      const response = await fetch("/api/users/currency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: currency.code }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update currency");
      }
      
      return response.json();
    },
    onSuccess: (_, currency) => {
      queryClient.setQueryData(["selectedCurrency"], currency);
      toast.success(`Currency changed to ${currency.code}`);
    },
    onError: (error) => {
      console.error("Error setting currency:", error);
      toast.error("Failed to change currency");
    },
  });
};

// Hook to get the current selected currency for use in formatMoney
export const useCurrentCurrency = () => {
  const { data: selectedCurrency } = useSelectedCurrency();
  return selectedCurrency || currencies[0]; // Fallback to USD
};
