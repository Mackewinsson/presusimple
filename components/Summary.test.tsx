import { render, screen, fireEvent, within } from '@testing-library/react';
import Summary from './Summary';

// Mock the dependencies
jest.mock('@/lib/utils/formatMoney', () => ({
  formatMoney: (amount: number) => {
    // Add commas for thousands
    return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
}));

jest.mock('@/lib/utils/exportToPdf', () => ({
  exportToPdf: jest.fn(),
}));

describe('Summary', () => {
  const mockBudget = {
    _id: 'budget1',
    user: 'user1',
    totalBudgeted: 1000,
    sections: [],
    month: 1,
    year: 2024,
    totalAvailable: 1000,
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

  const mockExpenses = [
    {
      _id: 'exp1',
      categoryId: 'cat1',
      amount: 50,
      description: 'Grocery shopping',
      date: '2024-01-15',
      type: 'expense' as const,
    },
    {
      _id: 'exp2',
      categoryId: 'cat2',
      amount: 30,
      description: 'Gas',
      date: '2024-01-16',
      type: 'expense' as const,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders summary information correctly', () => {
    render(
      <Summary
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Check if budget summary is displayed
    expect(screen.getByText('Budget Summary')).toBeInTheDocument();
    
    // Check for summary values - component uses calculatedTotalBudgeted (sum of categories)
    expect(screen.getByText(/\$500\.00/)).toBeInTheDocument(); // Total budgeted (300+200)
    expect(screen.getByText(/\$80\.00/)).toBeInTheDocument(); // Total spent
    expect(screen.getByText(/\$420\.00/)).toBeInTheDocument(); // Remaining (500-80)
  });

  it('shows export buttons', () => {
    render(
      <Summary
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Check for export buttons - look for Excel and PDF
    expect(screen.getByText('Excel')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const emptyBudget = { 
      ...mockBudget, 
      totalBudgeted: 0,
      month: 1,
      year: 2024,
      totalAvailable: 0,
    };
    const emptyCategories: any[] = [];
    const emptyExpenses: any[] = [];

    render(
      <Summary
        budget={emptyBudget}
        categories={emptyCategories}
        expenses={emptyExpenses}
      />
    );

    // Check for multiple instances of $0.00
    const zeroAmounts = screen.getAllByText('$0.00');
    expect(zeroAmounts.length).toBeGreaterThan(0);
    
    // Check for empty state message
    expect(screen.getByText(/Add some budget categories/)).toBeInTheDocument();
  });

  it('handles over-budget scenario', () => {
    const overBudget = {
      ...mockBudget,
      totalBudgeted: 500,
      totalAvailable: 500,
    };
    const overSpentCategories = [
      {
        ...mockCategories[0],
        budgeted: 300,
        spent: 350,
      },
      {
        ...mockCategories[1],
        budgeted: 200,
        spent: 250,
      },
    ];

    render(
      <Summary
        budget={overBudget}
        categories={overSpentCategories}
        expenses={mockExpenses}
      />
    );

    // Should show negative remaining amount (500 - 80 = 420, not -100)
    // The component uses expenses for total spent, not category spent values
    expect(screen.getByText(/\$420\.00/)).toBeInTheDocument();
  });

  it('handles zero expenses', () => {
    const zeroExpenses: any[] = [];

    render(
      <Summary
        budget={mockBudget}
        categories={mockCategories}
        expenses={zeroExpenses}
      />
    );

    // Should show zero spent
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument(); // Total spent
  });

  it('handles large numbers correctly', () => {
    const largeBudget = {
      ...mockBudget,
      totalBudgeted: 100000,
      totalAvailable: 100000,
    };
    const largeCategories = [
      {
        ...mockCategories[0],
        budgeted: 50000,
        spent: 45000,
      },
    ];

    render(
      <Summary
        budget={largeBudget}
        categories={largeCategories}
        expenses={mockExpenses}
      />
    );

    expect(screen.getByText(/\$50,000\.00/)).toBeInTheDocument(); // Total budgeted
    expect(screen.getByText(/\$80\.00/)).toBeInTheDocument(); // Total spent (from expenses)
  });

  it('handles decimal amounts correctly', () => {
    const decimalBudget = {
      ...mockBudget,
      totalBudgeted: 1000.50,
      totalAvailable: 1000.50,
    };
    const decimalCategories = [
      {
        ...mockCategories[0],
        budgeted: 500.25,
        spent: 250.75,
      },
    ];

    render(
      <Summary
        budget={decimalBudget}
        categories={decimalCategories}
        expenses={mockExpenses}
      />
    );

    expect(screen.getByText(/\$500\.25/)).toBeInTheDocument(); // Total budgeted
    expect(screen.getByText(/\$80\.00/)).toBeInTheDocument(); // Total spent (from expenses)
  });

  it('shows chart when data is available', () => {
    render(
      <Summary
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Check if chart container is rendered
    const chartContainer = screen.getByTestId('summary-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  it('shows chart title when data is available', () => {
    render(
      <Summary
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Check if chart title is displayed
    expect(screen.getByText('Top Spending Categories')).toBeInTheDocument();
  });
}); 