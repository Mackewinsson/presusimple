import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface BudgetTemplate {
  _id?: string;
  id?: string;
  name: string;
  sections: Array<{
    id: string;
    name: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    budgeted: number;
    sectionId: string;
  }>;
  createdAt?: string;
}

export const useBudgetTemplates = () => {
  return useQuery({
    queryKey: ["budgetTemplates"],
    queryFn: async (): Promise<BudgetTemplate[]> => {
      // For now, return empty array since we don't have API endpoints for templates
      // This will be implemented when we add template functionality to the backend
      return [];
    },
  });
};

export const useCreateBudgetTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      template: Omit<BudgetTemplate, "_id" | "id" | "createdAt">
    ) => {
      // For now, just return success since we don't have API endpoints
      // This will be implemented when we add template functionality to the backend
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetTemplates"] });
      toast.success("Budget template saved");
    },
    onError: (error) => {
      console.error("Error creating budget template:", error);
      toast.error("Failed to save budget template");
    },
  });
};

export const useDeleteBudgetTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      // For now, just return success since we don't have API endpoints
      // This will be implemented when we add template functionality to the backend
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetTemplates"] });
      toast.success("Template deleted");
    },
    onError: (error) => {
      console.error("Error deleting budget template:", error);
      toast.error("Failed to delete template");
    },
  });
};
