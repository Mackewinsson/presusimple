'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { calculatePercentage, getBudgetStatus } from '@/lib/utils/formatMoney';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  spent: number;
  budgeted: number;
  showPercentage?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  spent, 
  budgeted, 
  showPercentage = false,
  className
}) => {
  const percentage = calculatePercentage(spent, budgeted);
  const status = getBudgetStatus(spent, budgeted);

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-amber-500';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className={cn("w-full flex flex-col gap-1", className)}>
      <Progress 
        value={percentage} 
        className="h-2 bg-secondary"
        indicatorClassName={cn("transition-all duration-300", getStatusColor())}
      />
      {showPercentage && (
        <div className="text-xs text-muted-foreground">
          {percentage}% used
        </div>
      )}
    </div>
  );
};

export default ProgressBar;