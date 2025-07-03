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
      // For now, return USD as default since we don't have API endpoints for currency
      // This will be implemented when we add currency functionality to the backend
      return currencies[0];
    },
  });
};

export const useSetCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currency: Currency) => {
      // For now, just return success since we don't have API endpoints
      // This will be implemented when we add currency functionality to the backend
      return { success: true };
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
