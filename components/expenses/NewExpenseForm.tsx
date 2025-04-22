'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/useAppSelector';
import { addExpense } from '@/lib/store/expenseSlice';
import { addExpenseToCategory } from '@/lib/store/budgetSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const NewExpenseForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(state => state.budget.categories);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount === '' || categoryId === '') {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const expenseAmount = parseFloat(amount);
    
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    // Add the expense
    dispatch(addExpense({ 
      amount: expenseAmount, 
      description: description.trim(), 
      categoryId 
    }));
    
    // Update the category's spent amount
    dispatch(addExpenseToCategory({ 
      categoryId, 
      amount: expenseAmount 
    }));
    
    // Reset the form
    setAmount('');
    setDescription('');
    
    toast.success('Expense added successfully');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount*</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category*</Label>
            <Select 
              value={categoryId} 
              onValueChange={setCategoryId}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No categories available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you spend on?"
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={amount === '' || categoryId === '' || categories.length === 0}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Expense
      </Button>
    </form>
  );
};

export default NewExpenseForm;