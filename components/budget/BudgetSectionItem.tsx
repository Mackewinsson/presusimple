"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BudgetCategoryItem from "./BudgetCategoryItem";
import NewCategoryForm from "./NewCategoryForm";
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

interface Category {
  _id?: string;
  id?: string;
  name: string;
  budgeted: number;
  spent: number;
  sectionId: string;
}

interface Section {
  id?: string;
  _id?: string;
  name: string;
  displayName?: string;
  amount: number;
}

interface BudgetSectionItemProps {
  section: Section;
  categories: Category[];
  onRemove: (sectionName: string) => void;
  onAddCategory: (sectionId: string, name: string, budgeted: number) => void;
  onRemoveCategory: (categoryId: string) => void;
  onUpdateCategory: (
    categoryId: string,
    name: string,
    budgeted: number
  ) => void;
  totalAvailable: number;
}

const BudgetSectionItem: React.FC<BudgetSectionItemProps> = ({
  section,
  categories,
  onRemove,
  onAddCategory,
  onRemoveCategory,
  onUpdateCategory,
  totalAvailable,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const sectionCategories = categories.filter(
    (category) => category.sectionId === section.name
  );
  const totalBudgeted = sectionCategories.reduce(
    (sum, category) => sum + category.budgeted,
    0
  );
  const totalSpent = sectionCategories.reduce(
    (sum, category) => sum + category.spent,
    0
  );

  return (
    <Card className="w-full mb-4 shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base sm:text-lg font-medium">
            {section.displayName || section.name}
          </CardTitle>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg sm:text-xl">
                    Delete Budget Section
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm sm:text-base">
                    Are you sure you want to delete this section? This will
                    remove all categories and their budgeted amounts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-sm sm:text-base">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onRemove(section.name)}
                    className="text-sm sm:text-base"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <CardDescription className="flex flex-col sm:flex-row sm:justify-between mt-1 text-xs sm:text-sm gap-1 sm:gap-0">
          <span>Total: {sectionCategories.length} categories</span>
          <span>
            {totalSpent.toFixed(2)} / {totalBudgeted.toFixed(2)} (
            {Math.round((totalSpent / totalBudgeted) * 100) || 0}% )
          </span>
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <>
          <CardContent className="pb-4">
            {sectionCategories.length > 0 ? (
              <div className="space-y-3">
                {sectionCategories.map((category) => (
                  <BudgetCategoryItem
                    key={category._id || category.id}
                    category={category}
                    onRemove={onRemoveCategory}
                    onUpdate={onUpdateCategory}
                    totalAvailable={totalAvailable}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm sm:text-base">
                No categories yet. Add one below.
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center pt-0 pb-4">
            {isAddingCategory ? (
              <NewCategoryForm
                sectionId={section.name}
                onComplete={(name: string, budgeted: number) => {
                  onAddCategory(
                    section.name,
                    name,
                    budgeted
                  );
                  setIsAddingCategory(false);
                }}
                onCancel={() => setIsAddingCategory(false)}
                totalAvailable={totalAvailable}
              />
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center text-sm sm:text-base"
                onClick={() => setIsAddingCategory(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default BudgetSectionItem;
