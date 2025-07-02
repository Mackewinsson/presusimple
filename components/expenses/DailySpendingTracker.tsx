"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppSelector } from "@/lib/hooks/useAppSelector";
import { formatMoney } from "@/lib/utils/formatMoney";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import NewExpenseForm from "./NewExpenseForm";
import ExpenseList from "./ExpenseList";

const DailySpendingTracker: React.FC = () => {
  const { totalBudgeted, totalSpent } = useAppSelector((state) => state.budget);
  const remaining = totalBudgeted - totalSpent;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="shadow-md">
      <CardHeader className="relative">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-semibold">
              Transactions
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Track your daily income and expenses
            </CardDescription>
          </div>
          <div className="text-right">
            <div
              className={`text-base sm:text-lg font-medium ${
                remaining < 0 ? "text-destructive" : ""
              }`}
            >
              {formatMoney(remaining)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Available to Spend
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-background shadow-sm border"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="add" className="text-xs sm:text-sm">
              Add Transaction
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              Transaction History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            <NewExpenseForm />
          </TabsContent>

          <TabsContent value="history">
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? "h-[500px] sm:h-[600px]" : "h-[300px] sm:h-[400px]"
              }`}
            >
              <div className="h-full overflow-y-auto pr-2 scrollbar-thin">
                <ExpenseList />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DailySpendingTracker;
