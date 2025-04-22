'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/lib/hooks/useAppSelector';
import { formatMoney } from '@/lib/utils/formatMoney';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { toast } from 'sonner';

const Summary: React.FC = () => {
  const { categories, totalBudgeted, totalSpent } = useAppSelector(state => state.budget);
  const expenses = useAppSelector(state => state.expenses.expenses);
  
  // Get the top 5 categories by spent amount
  const topCategories = [...categories]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);
  
  const chartData = topCategories.map(cat => ({
    name: cat.name,
    spent: cat.spent,
    budgeted: cat.budgeted,
    overBudget: cat.spent > cat.budgeted,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">
            Spent: <span className="font-medium text-foreground">{formatMoney(data.spent)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Budgeted: <span className="font-medium text-foreground">{formatMoney(data.budgeted)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const handleExportToExcel = () => {
    try {
      // Create workbook
      const wb = utils.book_new();

      // Create Budget Summary worksheet
      const summaryData = [
        ['Budget Summary', ''],
        ['Total Budgeted', totalBudgeted.toString()],
        ['Total Spent', totalSpent.toString()],
        ['Remaining', (totalBudgeted - totalSpent).toString()],
        [],
        ['Category', 'Budgeted', 'Spent', 'Remaining']
      ];

      categories.forEach(category => {
        summaryData.push([
          category.name,
          category.budgeted.toString(),
          category.spent.toString(),
          (category.budgeted - category.spent).toString()
        ]);
      });

      const summaryWs = utils.aoa_to_sheet(summaryData);

      // Create Expenses worksheet
      const expensesData = [
        ['Expenses', '', '', ''],
        ['Date', 'Category', 'Description', 'Amount']
      ];

      expenses.forEach(expense => {
        const category = categories.find(c => c.id === expense.categoryId);
        expensesData.push([
          new Date(expense.date).toLocaleDateString(),
          category?.name || 'Unknown',
          expense.description || '-',
          expense.amount.toString()
        ]);
      });

      const expensesWs = utils.aoa_to_sheet(expensesData);

      // Add worksheets to workbook
      utils.book_append_sheet(wb, summaryWs, 'Budget Summary');
      utils.book_append_sheet(wb, expensesWs, 'Expenses');

      // Generate Excel file
      writeFile(wb, 'budget-report.xlsx');
      toast.success('Budget report exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export budget report');
    }
  };
  
  return (
    <Card className="glass-card hover-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Budget Summary
            </CardTitle>
            <CardDescription>
              Overview of your budget and top spending categories
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportToExcel}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-secondary/50 backdrop-blur text-center">
            <div className="text-sm text-muted-foreground mb-1">Total Budgeted</div>
            <div className="text-2xl font-semibold">{formatMoney(totalBudgeted)}</div>
          </div>
          
          <div className="p-4 rounded-xl bg-primary/5 backdrop-blur text-center">
            <div className="text-sm text-muted-foreground mb-1">Total Spent</div>
            <div className="text-2xl font-semibold">{formatMoney(totalSpent)}</div>
          </div>
          
          <div className="p-4 rounded-xl bg-secondary/50 backdrop-blur text-center">
            <div className="text-sm text-muted-foreground mb-1">Remaining</div>
            <div className={`text-2xl font-semibold ${totalBudgeted - totalSpent < 0 ? 'text-destructive' : ''}`}>
              {formatMoney(totalBudgeted - totalSpent)}
            </div>
          </div>
        </div>
        
        {topCategories.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-6">Top Spending Categories</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                  barGap={8}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke="hsl(var(--muted-foreground)/0.2)"
                  />
                  <XAxis 
                    dataKey="name" 
                    tick={{ 
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 12 
                    }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    height={60}
                    textAnchor="middle"
                  />
                  <YAxis 
                    tickFormatter={(value) => formatMoney(value)}
                    tick={{ 
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 12 
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                  />
                  <Bar 
                    dataKey="budgeted" 
                    fill="hsl(var(--muted))" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40}
                  />
                  <Bar 
                    dataKey="spent" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.overBudget 
                          ? 'hsl(var(--destructive))' 
                          : 'hsl(var(--primary))'
                        }
                      />
                    ))}
                    <LabelList 
                      dataKey="spent" 
                      position="top" 
                      formatter={(value: number) => formatMoney(value)}
                      style={{
                        fontSize: '12px',
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-lg bg-muted/30">
            <p className="text-muted-foreground">
              Add some budget categories and expenses to see a summary
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Summary;