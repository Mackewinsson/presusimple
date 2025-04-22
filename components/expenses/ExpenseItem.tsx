'use client';

import React, { useState } from 'react';
import { Expense } from '@/lib/store/expenseSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/useAppSelector';
import { removeExpense, updateExpense } from '@/lib/store/expenseSlice';
import { addExpenseToCategory } from '@/lib/store/budgetSlice';
import { formatMoney } from '@/lib/utils/formatMoney';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Save, Trash2, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface ExpenseItemProps {
  expense: Expense;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense }) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState(expense.amount.toString());
  const [editedDescription, setEditedDescription] = useState(expense.description);
  const [editedCategoryId, setEditedCategoryId] = useState(expense.categoryId);
  
  const categories = useAppSelector(state => state.budget.categories);
  const category = categories.find(cat => cat.id === expense.categoryId);
  
  const handleRemoveExpense = () => {
    if (category) {
      dispatch(addExpenseToCategory({ 
        categoryId: expense.categoryId, 
        amount: -expense.amount 
      }));
    }
    
    dispatch(removeExpense({ id: expense.id }));
    toast.success('Transaction deleted');
  };
  
  const handleSaveEdit = () => {
    const newAmount = parseFloat(editedAmount);
    
    if (isNaN(newAmount) || newAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    // Remove old amount from old category
    dispatch(addExpenseToCategory({
      categoryId: expense.categoryId,
      amount: -expense.amount
    }));
    
    // Add new amount to new (or same) category
    dispatch(addExpenseToCategory({
      categoryId: editedCategoryId,
      amount: newAmount
    }));
    
    // Update the expense
    dispatch(updateExpense({
      id: expense.id,
      amount: newAmount,
      description: editedDescription.trim(),
      categoryId: editedCategoryId
    }));
    
    setIsEditing(false);
    toast.success('Transaction updated');
  };
  
  const handleCancelEdit = () => {
    setEditedAmount(expense.amount.toString());
    setEditedDescription(expense.description);
    setEditedCategoryId(expense.categoryId);
    setIsEditing(false);
  };
  
  const formattedDate = format(new Date(expense.date), 'MMM dd, yyyy');
  
  if (!category) {
    return null; // The category has been deleted, don't show this expense
  }

  return (
    <div className="p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors duration-200">
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Input
                type="number"
                value={editedAmount}
                onChange={(e) => setEditedAmount(e.target.value)}
                placeholder="Amount"
                min="0.01"
                step="0.01"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Select 
                value={editedCategoryId} 
                onValueChange={setEditedCategoryId}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Input
            type="text"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Description (optional)"
            className="h-9"
          />
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              className="h-8"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="font-medium">
                {expense.description || `Expense for ${category.name}`}
              </div>
              <div className="text-sm text-muted-foreground">
                {category.name} • {formattedDate}
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="text-right">
                <div className="font-medium">{formatMoney(expense.amount)}</div>
              </div>
              <div className="flex items-center space-x-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this transaction of {formatMoney(expense.amount)}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemoveExpense}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseItem;