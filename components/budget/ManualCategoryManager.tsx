"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, DollarSign, Trash2, Edit2, Check, X } from "lucide-react";
import { formatMoney } from "@/lib/utils/formatMoney";
import { toast } from "sonner";
import { useCurrentCurrency } from "@/lib/hooks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useUserId,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";

interface Category {
  _id?: string;
  id?: string;
  name: string;
  budgeted: number;
  spent: number;
  sectionId: string;
}

interface ManualCategoryManagerProps {
  budget: any;
  categories: Category[];
  totalAvailable: number;
}

const ManualCategoryManager: React.FC<ManualCategoryManagerProps> = ({
  budget,
  categories,
  totalAvailable,
}) => {
  const { data: userId } = useUserId();
  const currentCurrency = useCurrentCurrency();
  const queryClient = useQueryClient();
  
  // React Query mutations
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Local state for category management
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryBudget, setNewCategoryBudget] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editBudget, setEditBudget] = useState("");

  // Calculate total budgeted from categories
  const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const remainingAvailable = totalAvailable - totalBudgeted;

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !budget) return;

    const name = newCategoryName.trim();
    const budgeted = parseFloat(newCategoryBudget);

    if (!name || isNaN(budgeted) || budgeted < 0) {
      toast.error("Please enter valid category name and budget amount");
      return;
    }

    if (budgeted > remainingAvailable) {
      toast.error(
        `Cannot budget more than available amount (${formatMoney(remainingAvailable)})`
      );
      return;
    }

    try {
      await createCategoryMutation.mutateAsync({
        name,
        budgeted,
        sectionId: "General", // Default section for manual categories
        userId,
        budgetId: budget._id,
      });

      // Reset form
      setNewCategoryName("");
      setNewCategoryBudget("");
      setIsAddingCategory(false);
      
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category. Please try again.");
    }
  };

  const handleUpdateCategory = async (categoryId: string) => {
    const name = editName.trim();
    const budgeted = parseFloat(editBudget);

    if (!name || isNaN(budgeted) || budgeted < 0) {
      toast.error("Please enter valid category name and budget amount");
      return;
    }

    const category = categories.find(c => c._id === categoryId || c.id === categoryId);
    if (!category) return;

    const budgetDiff = budgeted - category.budgeted;
    if (budgetDiff > remainingAvailable) {
      toast.error(
        `Cannot increase budget by more than available amount (${formatMoney(remainingAvailable)})`
      );
      return;
    }

    try {
      await updateCategoryMutation.mutateAsync({
        id: categoryId,
        updates: { name, budgeted },
      });

      setEditingCategory(null);
      setEditName("");
      setEditBudget("");
      
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category. Please try again.");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category._id || category.id || "");
    setEditName(category.name);
    setEditBudget(category.budgeted.toString());
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName("");
    setEditBudget("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Manual Category Management
        </CardTitle>
        <CardDescription>
          Create and manage your budget categories manually
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Budgeted</p>
            <p className="text-lg font-semibold">{formatMoney(totalBudgeted)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-lg font-semibold">{formatMoney(remainingAvailable)}</p>
          </div>
        </div>

        {/* Add Category Form */}
        {isAddingCategory ? (
          <Card className="p-4 border">
            <form onSubmit={handleAddCategory} className="space-y-3">
              <Input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name (e.g., Rent, Groceries)"
                className="w-full"
                autoFocus
              />
              <div className="relative">
                <Input
                  type="number"
                  value={newCategoryBudget}
                  onChange={(e) => setNewCategoryBudget(e.target.value)}
                  placeholder="Budget amount"
                  min="0"
                  max={remainingAvailable}
                  step="0.01"
                  className="w-full"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  Available: {formatMoney(remainingAvailable)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                    setNewCategoryBudget("");
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newCategoryName.trim() || !newCategoryBudget}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Button
            onClick={() => setIsAddingCategory(true)}
            className="w-full"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Category
          </Button>
        )}

        {/* Categories List */}
        {categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category) => (
              <Card key={category._id || category.id} className="p-4">
                {editingCategory === (category._id || category.id) ? (
                  <div className="space-y-3">
                    <Input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Category name"
                      className="w-full"
                      autoFocus
                    />
                    <div className="relative">
                      <Input
                        type="number"
                        value={editBudget}
                        onChange={(e) => setEditBudget(e.target.value)}
                        placeholder="Budget amount"
                        min="0"
                        step="0.01"
                        className="w-full"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        Available: {formatMoney(remainingAvailable)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleUpdateCategory(category._id || category.id || "")}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatMoney(category.spent)} / {formatMoney(category.budgeted)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{category.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category._id || category.id || "")}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No categories yet. Add your first category above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManualCategoryManager; 