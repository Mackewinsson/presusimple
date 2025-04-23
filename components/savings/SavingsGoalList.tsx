'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/useAppSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addGoal, updateGoalProgress, deleteGoal } from '@/lib/store/savingsGoalSlice';
import { formatMoney } from '@/lib/utils/formatMoney';
import { Plus, Target, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const SavingsGoalList = () => {
  const dispatch = useAppDispatch();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  
  const goals = useAppSelector(state => state.savingsGoals.goals);
  const categories = useAppSelector(state => state.budget.categories);
  
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !targetAmount) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }
    
    dispatch(addGoal({
      name: name.trim(),
      targetAmount: amount,
      deadline: deadline || undefined,
      categoryId: selectedCategoryId || undefined,
    }));
    
    setName('');
    setTargetAmount('');
    setDeadline('');
    setSelectedCategoryId('');
    setIsAddingGoal(false);
    
    toast.success('Savings goal added');
  };
  
  const handleDeleteGoal = (id: string) => {
    dispatch(deleteGoal({ id }));
    toast.success('Savings goal deleted');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Savings Goals
        </CardTitle>
        <CardDescription>Track your progress towards savings targets</CardDescription>
      </CardHeader>
      
      <CardContent>
        {isAddingGoal ? (
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name*</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Emergency Fund, New Car"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Target Amount*</Label>
              <Input
                id="amount"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Target Date (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Link to Category (Optional)</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
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
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingGoal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Goal</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.map(goal => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  const category = goal.categoryId 
                    ? categories.find(c => c.id === goal.categoryId)
                    : null;
                    
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{goal.name}</div>
                          {category && (
                            <div className="text-sm text-muted-foreground">
                              Linked to: {category.name}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {formatMoney(goal.currentAmount)} of {formatMoney(goal.targetAmount)}
                        </span>
                        <span className="font-medium">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      
                      {goal.deadline && (
                        <div className="text-sm text-muted-foreground">
                          Target date: {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No savings goals yet. Add one to get started.
              </div>
            )}
            
            <Button
              onClick={() => setIsAddingGoal(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Savings Goal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsGoalList;