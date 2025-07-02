import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseApi, Expense } from "../api";
import { toast } from "sonner";

// Query keys
export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (userId: string) => [...expenseKeys.lists(), userId] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

// Get expenses for a user
export const useExpenses = (userId: string) => {
  return useQuery({
    queryKey: expenseKeys.list(userId),
    queryFn: () => expenseApi.getExpenses(userId),
    enabled: !!userId,
  });
};

// Create expense mutation
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseApi.createExpense,
    onSuccess: (data, variables) => {
      // Invalidate and refetch expense queries
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      // Also invalidate category queries since expenses affect category spent amounts
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // Also invalidate budget queries since expenses affect budget totals
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Expense added successfully");
    },
    onError: (error) => {
      console.error("Failed to create expense:", error);
      toast.error("Failed to add expense");
    },
  });
};

// Update expense mutation
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Expense> }) =>
      expenseApi.updateExpense(id, updates),
    onSuccess: (data, variables) => {
      // Update the cache directly
      queryClient.setQueryData(expenseKeys.detail(variables.id), data);
      // Invalidate lists to refresh any list views
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      // Also invalidate category queries since expenses affect category spent amounts
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // Also invalidate budget queries since expenses affect budget totals
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Expense updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update expense:", error);
      toast.error("Failed to update expense");
    },
  });
};

// Delete expense mutation
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseApi.deleteExpense,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: expenseKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      // Also invalidate category queries since expenses affect category spent amounts
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // Also invalidate budget queries since expenses affect budget totals
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Expense deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete expense:", error);
      toast.error("Failed to delete expense");
    },
  });
};
