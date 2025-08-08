import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExpenseList from './ExpenseList';

// Mock the dependencies
jest.mock('@/lib/utils/formatMoney', () => ({
  formatMoney: (amount: number) => `$${amount.toFixed(2)}`,
}));

describe('ExpenseList', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  const mockExpenses = [
    {
      _id: 'exp1',
      categoryId: 'cat1',
      amount: 50.00,
      description: 'Grocery shopping',
      date: '2024-01-15',
      type: 'expense' as const,
    },
    {
      _id: 'exp2',
      categoryId: 'cat2',
      amount: 25.00,
      description: 'Gas',
      date: '2024-01-16',
      type: 'expense' as const,
    },
  ];

  const mockCategories = [
    {
      _id: 'cat1',
      name: 'Groceries',
      budgeted: 300,
      spent: 250,
      budgetId: 'budget1',
    },
    {
      _id: 'cat2',
      name: 'Transportation',
      budgeted: 200,
      spent: 180,
      budgetId: 'budget1',
    },
  ];

  it('renders expense list correctly', () => {
    renderWithProviders(
      <ExpenseList
        expenses={mockExpenses}
        categories={mockCategories}
      />
    );

    expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    expect(screen.getByText('Gas')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });

  it('shows empty state when no expenses', () => {
    renderWithProviders(
      <ExpenseList
        expenses={[]}
        categories={mockCategories}
      />
    );

    expect(screen.getByText(/No transactions yet/)).toBeInTheDocument();
  });

  it('displays correct number of expenses', () => {
    renderWithProviders(
      <ExpenseList
        expenses={mockExpenses}
        categories={mockCategories}
      />
    );

    // Should show both expenses
    expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    expect(screen.getByText('Gas')).toBeInTheDocument();
  });
}); 