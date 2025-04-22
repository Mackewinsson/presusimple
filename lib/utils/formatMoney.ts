/**
 * Format a number as a currency string
 */
export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate the percentage of a value relative to a total
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
};

/**
 * Determine the status of a budget category based on spending
 */
export const getBudgetStatus = (spent: number, budgeted: number): 'success' | 'warning' | 'danger' => {
  const percentage = calculatePercentage(spent, budgeted);
  
  if (percentage >= 100) return 'danger';
  if (percentage >= 80) return 'warning';
  return 'success';
};