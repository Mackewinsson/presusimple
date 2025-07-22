import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi, Category } from "../api";
import { toast } from "sonner";

// Query keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (userId: string) => [...categoryKeys.lists(), userId] as const,
  listByBudget: (budgetId: string) => [...categoryKeys.lists(), "budget", budgetId] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Get categories for a user
export const useCategories = (userId: string) => {
  return useQuery({
    queryKey: categoryKeys.list(userId),
    queryFn: () => categoryApi.getCategories(userId),
    enabled: !!userId,
  });
};

// Get categories for a budget
export const useCategoriesByBudget = (budgetId: string) => {
  return useQuery({
    queryKey: categoryKeys.listByBudget(budgetId),
    queryFn: () => categoryApi.getCategoriesByBudget(budgetId),
    enabled: !!budgetId,
  });
};

// Create category mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: (data, variables) => {
      // Invalidate and refetch all category queries (including budget-specific ones)
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Also invalidate budget queries since categories affect budget totals
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      console.error("Failed to create category:", error);
      toast.error("Failed to create category");
    },
  });
};

// Update category mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) =>
      categoryApi.updateCategory(id, updates),
    onSuccess: (data, variables) => {
      // Update the cache directly
      queryClient.setQueryData(categoryKeys.detail(variables.id), data);
      // Invalidate all category queries to refresh any list views
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Also invalidate budget queries since categories affect budget totals
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update category:", error);
      toast.error("Failed to update category");
    },
  });
};

// Delete category mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryApi.deleteCategory,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) });
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Also invalidate budget queries since categories affect budget totals
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category");
    },
  });
};
