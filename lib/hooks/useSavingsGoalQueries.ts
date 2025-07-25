// TODO: Implement savings goals feature later
// This file is temporarily disabled

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";

// export interface SavingsGoal {
//   _id?: string;
//   id?: string;
//   name: string;
//   targetAmount: number;
//   currentAmount: number;
//   deadline?: string;
//   categoryId?: string;
//   createdAt?: string;
// }

// export const useSavingsGoals = () => {
//   return useQuery({
//     queryKey: ["savingsGoals"],
//     queryFn: async (): Promise<SavingsGoal[]> => {
//       // For now, return empty array since we don't have API endpoints for savings goals
//       // This will be implemented when we add savings goal functionality to the backend
//       return [];
//     },
//   });
// };

// export const useCreateSavingsGoal = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (
//       goal: Omit<SavingsGoal, "_id" | "id" | "currentAmount" | "createdAt">
//     ) => {
//       // For now, just return success since we don't have API endpoints
//       // This will be implemented when we add savings goal functionality to the backend
//       return { success: true };
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["savingsGoals"] });
//       toast.success("Savings goal added");
//     },
//     onError: (error) => {
//       console.error("Error creating savings goal:", error);
//       toast.error("Failed to add savings goal");
//     },
//   });
// };

// export const useUpdateSavingsGoalProgress = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
//       // For now, just return success since we don't have API endpoints
//       // This will be implemented when we add savings goal functionality to the backend
//       return { success: true };
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["savingsGoals"] });
//       toast.success("Savings goal progress updated");
//     },
//     onError: (error) => {
//       console.error("Error updating savings goal progress:", error);
//       toast.error("Failed to update savings goal progress");
//     },
//   });
// };

// export const useDeleteSavingsGoal = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (goalId: string) => {
//       // For now, just return success since we don't have API endpoints
//       // This will be implemented when we add savings goal functionality to the backend
//       return { success: true };
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["savingsGoals"] });
//       toast.success("Savings goal deleted");
//     },
//     onError: (error) => {
//       console.error("Error deleting savings goal:", error);
//       toast.error("Failed to delete savings goal");
//     },
//   });
// };
