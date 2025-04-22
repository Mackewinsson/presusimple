'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/useAppSelector';
import { BudgetSection, removeSection } from '@/lib/store/budgetSlice';
import BudgetCategoryItem from './BudgetCategoryItem';
import NewCategoryForm from './NewCategoryForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface BudgetSectionItemProps {
  section: BudgetSection;
}

const BudgetSectionItem: React.FC<BudgetSectionItemProps> = ({ section }) => {
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const categories = useAppSelector(state => 
    state.budget.categories.filter(category => category.sectionId === section.id)
  );
  
  const handleRemoveSection = () => {
    dispatch(removeSection({ id: section.id }));
  };
  
  const totalBudgeted = categories.reduce((sum, category) => sum + category.budgeted, 0);
  const totalSpent = categories.reduce((sum, category) => sum + category.spent, 0);

  return (
    <Card className="w-full mb-4 shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{section.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Budget Section</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this section? This will remove all categories and their budgeted amounts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemoveSection}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <CardDescription className="flex justify-between mt-1 text-sm">
          <span>Total: {categories.length} categories</span>
          <span>{totalSpent.toFixed(2)} / {totalBudgeted.toFixed(2)} ({Math.round((totalSpent / totalBudgeted) * 100) || 0}%)</span>
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <>
          <CardContent className="pb-4">
            {categories.length > 0 ? (
              <div className="space-y-3">
                {categories.map(category => (
                  <BudgetCategoryItem 
                    key={category.id} 
                    category={category}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No categories yet. Add one below.
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center pt-0 pb-4">
            {isAddingCategory ? (
              <NewCategoryForm 
                sectionId={section.id} 
                onComplete={() => setIsAddingCategory(false)}
              />
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                className="w-full flex items-center justify-center"
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