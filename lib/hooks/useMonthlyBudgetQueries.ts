import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { monthlyBudgetApi, MonthlyBudget } from "../api";
import { toast } from "sonner";

// Query keys
export const monthlyBudgetKeys = {
  all: ["monthly-budgets"] as const,
  lists: () => [...monthlyBudgetKeys.all, "list"] as const,
  list: (userId: string) => [...monthlyBudgetKeys.lists(), userId] as const,
  details: () => [...monthlyBudgetKeys.all, "detail"] as const,
  detail: (id: string) => [...monthlyBudgetKeys.details(), id] as const,
};

// Get monthly budgets for a user
export const useMonthlyBudgets = (userId: string) => {
  return useQuery({
    queryKey: monthlyBudgetKeys.list(userId),
    queryFn: () => monthlyBudgetApi.getMonthlyBudgets(userId),
    enabled: !!userId,
  });
};

// Save monthly budget mutation
export const useSaveMonthlyBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: monthlyBudgetApi.saveMonthlyBudget,
    onSuccess: (data, variables) => {
      // Invalidate and refetch monthly budget queries
      queryClient.invalidateQueries({ queryKey: monthlyBudgetKeys.lists() });
      toast.success("Monthly budget saved successfully");
    },
    onError: (error) => {
      console.error("Failed to save monthly budget:", error);
      toast.error("Failed to save monthly budget");
    },
  });
};

// Delete monthly budget mutation
export const useDeleteMonthlyBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: monthlyBudgetApi.deleteMonthlyBudget,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: monthlyBudgetKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: monthlyBudgetKeys.lists() });
      toast.success("Monthly budget deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete monthly budget:", error);
      toast.error("Failed to delete monthly budget");
    },
  });
};
