'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/useAppSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import BudgetSectionItem from './BudgetSectionItem';
import NewSectionForm from './NewSectionForm';
import { formatMoney } from '@/lib/utils/formatMoney';
import { setTotalAvailable } from '@/lib/store/budgetSlice';
import { toast } from 'sonner';

const BudgetSetupSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [totalBudget, setTotalBudget] = useState('');
  
  const { sections, totalBudgeted, totalAvailable } = useAppSelector(state => state.budget);
  const currency = useAppSelector(state => state.currency.selected);

  const handleSetTotalBudget = () => {
    const amount = parseFloat(totalBudget);
    
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount < totalBudgeted) {
      toast.error('New total cannot be less than currently budgeted amount');
      return;
    }
    
    dispatch(setTotalAvailable(amount - totalBudgeted));
    setIsEditingTotal(false);
    setTotalBudget('');
    toast.success('Total budget updated');
  };

  return (
    <Card className="glass-card hover-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Budget Setup
            </CardTitle>
            <CardDescription>
              Create budget sections and categories to track your spending
            </CardDescription>
          </div>
          <div className="text-right">
            {isEditingTotal ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder="Total budget"
                    className="w-40 pl-9"
                    min={totalBudgeted}
                    step="0.01"
                  />
                </div>
                <Button size="sm" onClick={handleSetTotalBudget}>Set</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingTotal(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingTotal(true)} 
                className="p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <div className="text-lg font-medium">
                  {formatMoney(totalBudgeted + totalAvailable, currency)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Budget (click to edit)
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-secondary/50 backdrop-blur">
            <div className="text-sm text-muted-foreground">Budgeted</div>
            <div className="text-lg font-medium mt-1">{formatMoney(totalBudgeted, currency)}</div>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 backdrop-blur">
            <div className="text-sm text-muted-foreground">Available to Budget</div>
            <div className="text-lg font-medium mt-1">{formatMoney(totalAvailable, currency)}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {sections.length > 0 ? (
            <div className="space-y-4">
              {sections.map(section => (
                <BudgetSectionItem 
                  key={section.id} 
                  section={section}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-lg bg-muted/30">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">
                No budget sections yet. Add one to get started.
              </p>
            </div>
          )}
          
          {isAddingSection ? (
            <NewSectionForm 
              onComplete={() => setIsAddingSection(false)}
            />
          ) : (
            <Button 
              onClick={() => setIsAddingSection(true)}
              className="w-full mt-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Budget Section
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetSetupSection;