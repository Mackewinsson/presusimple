'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface BudgetStatus {
  hasBudget: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useBudgetStatus(): BudgetStatus {
  const { data: session } = useSession();
  const [status, setStatus] = useState<BudgetStatus>({
    hasBudget: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!session?.user?.email) {
      setStatus({
        hasBudget: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    const checkBudgetStatus = async () => {
      try {
        setStatus(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch('/api/budgets');
        
        if (!response.ok) {
          throw new Error('Failed to fetch budget status');
        }

        const budgets = await response.json();
        const hasBudget = Array.isArray(budgets) && budgets.length > 0;

        setStatus({
          hasBudget,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error checking budget status:', error);
        setStatus({
          hasBudget: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    checkBudgetStatus();
  }, [session?.user?.email]);

  return status;
}
