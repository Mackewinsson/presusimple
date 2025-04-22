'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/lib/hooks/useAppSelector';
import { formatMoney } from '@/lib/utils/formatMoney';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewExpenseForm from './NewExpenseForm';
import ExpenseList from './ExpenseList';

const DailySpendingTracker: React.FC = () => {
  const { totalBudgeted, totalSpent } = useAppSelector(state => state.budget);
  const remaining = totalBudgeted - totalSpent;
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-semibold">Daily Spending</CardTitle>
            <CardDescription>
              Track your daily expenses and see remaining budget
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-lg font-medium ${remaining < 0 ? 'text-destructive' : ''}`}>
              {formatMoney(remaining)}
            </div>
            <div className="text-sm text-muted-foreground">
              Available to Spend
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="add">Add Expense</TabsTrigger>
            <TabsTrigger value="history">Expense History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4">
            <NewExpenseForm />
          </TabsContent>
          
          <TabsContent value="history">
            <ExpenseList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DailySpendingTracker;