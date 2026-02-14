import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { decimalSeparatorApi, type DecimalSeparator } from "../api";
import { toast } from "sonner";

const DECIMAL_SEPARATOR_KEY = ["decimalSeparator"] as const;

export const useDecimalSeparator = () => {
  return useQuery({
    queryKey: DECIMAL_SEPARATOR_KEY,
    queryFn: decimalSeparatorApi.get,
  });
};

export const useSetDecimalSeparator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: decimalSeparatorApi.update,
    onSuccess: (_, separator) => {
      queryClient.setQueryData(DECIMAL_SEPARATOR_KEY, separator);
      toast.success(
        separator === "comma"
          ? "Decimal separator set to comma (1.234,56)"
          : "Decimal separator set to dot (1,234.56)"
      );
    },
    onError: (error) => {
      console.error("Failed to set decimal separator:", error);
      toast.error("Failed to update decimal separator");
    },
  });
};

export const useCurrentDecimalSeparator = (): DecimalSeparator => {
  const { data } = useDecimalSeparator();
  return data ?? "dot";
};
