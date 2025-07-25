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
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BudgetCategoryItem from "./BudgetCategoryItem";
import NewCategoryForm from "./NewCategoryForm";
import InlineEdit from "@/components/ui/inline-edit";


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
  onUpdateSection: (oldSectionName: string, newSectionName: string) => void;
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
  onUpdateSection,
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
          <InlineEdit
            value={section.displayName || section.name}
            onSave={(newName: string) => onUpdateSection(section.name, newName)}
            onDelete={() => onRemove(section.name)}
            className="flex-1"
            buttonClassName="h-8 w-8 p-0"
            showDelete={true}
            validation={(value: string) => {
              // Check if section name already exists (excluding current section)
              // We need to check against other sections, not categories
              // This validation should be handled at the parent level
              return null;
            }}
          />
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
