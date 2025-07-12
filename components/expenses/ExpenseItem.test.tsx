import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseItem from './ExpenseItem';

// Mock the dependencies
jest.mock('@/lib/utils/formatMoney', () => ({
  formatMoney: (amount: number) => {
    return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
}));

jest.mock('@/lib/hooks', () => ({
  useUpdateExpense: () => ({
    mutateAsync: jest.fn(),
    isLoading: false,
  }),
  useDeleteExpense: () => ({
    mutateAsync: jest.fn(),
    isLoading: false,
  }),
}));

describe('ExpenseItem', () => {
  const mockExpense = {
    _id: 'exp1',
    categoryId: 'cat1',
    amount: 50.00,
    description: 'Grocery shopping',
    date: '2024-01-15',
    type: 'expense' as const,
  };

  const mockCategories = [
    {
      _id: 'cat1',
      name: 'Groceries',
      budgeted: 300,
      spent: 250,
      sectionId: 'section1',
    },
    {
      _id: 'cat2',
      name: 'Transportation',
      budgeted: 200,
      spent: 180,
      sectionId: 'section1',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders expense information correctly', () => {
    render(
      <ExpenseItem
        expense={mockExpense}
        categories={mockCategories}
      />
    );

    expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
    expect(screen.getByText(/Groceries/)).toBeInTheDocument();
  });

  it('displays date correctly', () => {
    render(
      <ExpenseItem
        expense={mockExpense}
        categories={mockCategories}
      />
    );

    // Check if date is displayed (format may vary)
    expect(screen.getByText(/Jan 15/)).toBeInTheDocument();
  });

  it('shows edit and delete buttons', () => {
    render(
      <ExpenseItem
        expense={mockExpense}
        categories={mockCategories}
      />
    );

    // Check for edit and delete buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles delete confirmation dialog', () => {
    render(
      <ExpenseItem
        expense={mockExpense}
        categories={mockCategories}
      />
    );

    // Click delete button (second button in the action group)
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[1];
    fireEvent.click(deleteButton);

    // Should show confirmation dialog
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
  });

  it('handles long descriptions', () => {
    const longDescriptionExpense = {
      ...mockExpense,
      description: 'Very long expense description that should be handled properly by the component',
    };

    render(
      <ExpenseItem
        expense={longDescriptionExpense}
        categories={mockCategories}
      />
    );

    expect(screen.getByText('Very long expense description that should be handled properly by the component')).toBeInTheDocument();
  });

  it('handles decimal amounts correctly', () => {
    const decimalExpense = {
      ...mockExpense,
      amount: 25.99,
    };

    render(
      <ExpenseItem
        expense={decimalExpense}
        categories={mockCategories}
      />
    );

    expect(screen.getByText(/\$25\.99/)).toBeInTheDocument();
  });

  it('handles zero amount', () => {
    const zeroExpense = {
      ...mockExpense,
      amount: 0,
    };

    render(
      <ExpenseItem
        expense={zeroExpense}
        categories={mockCategories}
      />
    );

    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
  });

  it('handles large amounts', () => {
    const largeExpense = {
      ...mockExpense,
      amount: 9999.99,
    };

    render(
      <ExpenseItem
        expense={largeExpense}
        categories={mockCategories}
      />
    );

    expect(screen.getByText(/\$9,999\.99/)).toBeInTheDocument();
  });

  it('handles empty description', () => {
    const emptyDescriptionExpense = {
      ...mockExpense,
      description: '',
    };

    render(
      <ExpenseItem
        expense={emptyDescriptionExpense}
        categories={mockCategories}
      />
    );

    // Should show some placeholder or empty state
    expect(screen.getAllByText(/Groceries/).length).toBeGreaterThan(0);
  });

  it('handles missing category gracefully', () => {
    const expenseWithMissingCategory = {
      ...mockExpense,
      categoryId: 'nonexistent',
    };

    render(
      <ExpenseItem
        expense={expenseWithMissingCategory}
        categories={mockCategories}
      />
    );

    // Should still render the expense
    expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
  });

  it('handles different date formats', () => {
    const differentDateExpense = {
      ...mockExpense,
      date: '2024-12-25',
    };

    render(
      <ExpenseItem
        expense={differentDateExpense}
        categories={mockCategories}
      />
    );

    // Should display the date correctly
    expect(screen.getByText(/Dec 25/)).toBeInTheDocument();
  });

  it('shows category name when available', () => {
    render(
      <ExpenseItem
        expense={mockExpense}
        categories={mockCategories}
      />
    );

    expect(screen.getByText(/Groceries/)).toBeInTheDocument();
  });

  it('handles expense with special characters in description', () => {
    const specialCharExpense = {
      ...mockExpense,
      description: 'Expense with special chars: @#$%^&*()',
    };

    render(
      <ExpenseItem
        expense={specialCharExpense}
        categories={mockCategories}
      />
    );

    expect(screen.getByText('Expense with special chars: @#$%^&*()')).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', () => {
    render(
      <ExpenseItem
        expense={mockExpense}
        categories={mockCategories}
      />
    );

    // Click edit button
    const buttons = screen.getAllByRole('button');
    const editButton = buttons[0]; // First button is edit
    fireEvent.click(editButton);

    // Should show edit form
    expect(screen.getByDisplayValue('50')).toBeInTheDocument(); // Amount input
    expect(screen.getByDisplayValue('Grocery shopping')).toBeInTheDocument(); // Description input
  });

  it('handles income type expenses', () => {
    const incomeExpense = {
      ...mockExpense,
      type: 'income' as const,
      description: 'Salary',
      amount: 2000,
    };

    render(
      <ExpenseItem
        expense={incomeExpense}
        categories={mockCategories}
      />
    );

    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText(/\$2,000\.00/)).toBeInTheDocument();
  });
}); 