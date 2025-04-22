'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks/useAppSelector';
import ExpenseItem from './ExpenseItem';
import { compareDesc } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const ExpenseList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const expenses = useAppSelector(state => state.expenses.expenses);
  const categories = useAppSelector(state => state.budget.categories);
  
  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => 
    compareDesc(new Date(a.date), new Date(b.date))
  );
  
  // Filter expenses based on search term
  const filteredExpenses = sortedExpenses.filter(expense => {
    const category = categories.find(cat => cat.id === expense.categoryId);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      expense.description.toLowerCase().includes(searchLower) ||
      category?.name.toLowerCase().includes(searchLower)
    );
  });
  
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No expenses yet. Add one to get started.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="space-y-2">
        {filteredExpenses.map(expense => (
          <ExpenseItem 
            key={expense.id} 
            expense={expense}
          />
        ))}
      </div>
      
      {filteredExpenses.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No transactions found matching your search.
        </div>
      )}
    </div>
  );
};

export default ExpenseList;