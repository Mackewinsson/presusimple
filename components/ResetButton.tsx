'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/lib/hooks/useAppDispatch';
import { resetBudget } from '@/lib/store/budgetSlice';
import { clearExpenses } from '@/lib/store/expenseSlice';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const ResetButton: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const handleReset = () => {
    // Reset spending but keep categories
    dispatch(resetBudget());
    dispatch(clearExpenses());
    
    toast.success('All expenses have been cleared for a new month');
  };
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Reset Month
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Monthly Budget</AlertDialogTitle>
          <AlertDialogDescription>
            This will clear all spending data, but keep your budget categories 
            and their assigned amounts. Use this when starting a new month.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>
            Reset Month
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetButton;