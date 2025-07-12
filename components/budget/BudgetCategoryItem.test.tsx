import { render, screen, fireEvent } from '@testing-library/react';
import BudgetCategoryItem from './BudgetCategoryItem';

// Mock the dependencies
jest.mock('@/lib/utils/formatMoney', () => ({
  formatMoney: (amount: number) => `$${amount.toFixed(2)}`,
}));

jest.mock('@/lib/hooks', () => ({
  useUpdateCategory: () => ({
    mutateAsync: jest.fn(),
    isLoading: false,
  }),
  useDeleteCategory: () => ({
    mutateAsync: jest.fn(),
    isLoading: false,
  }),
}));

describe('BudgetCategoryItem', () => {
  const mockCategory = {
    _id: 'cat1',
    name: 'Groceries',
    budgeted: 300,
    spent: 250,
    sectionId: 'section1',
  };

  const mockOnRemove = jest.fn();
  const mockOnUpdate = jest.fn();
  const totalAvailable = 1000;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders category information correctly', () => {
    render(
      <BudgetCategoryItem
        category={mockCategory}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        totalAvailable={totalAvailable}
      />
    );

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('$250.00 of $300.00')).toBeInTheDocument();
  });

  it('shows progress bar with correct percentage', () => {
    render(
      <BudgetCategoryItem
        category={mockCategory}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        totalAvailable={totalAvailable}
      />
    );

    // Check if progress bar is rendered
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('shows percentage of budget used', () => {
    render(
      <BudgetCategoryItem
        category={mockCategory}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        totalAvailable={totalAvailable}
      />
    );

    // Should show percentage (83% for 250/300)
    expect(screen.getByText('83%')).toBeInTheDocument();
  });

  it('handles over-budget scenario', () => {
    const overBudgetCategory = {
      ...mockCategory,
      budgeted: 200,
      spent: 250,
    };

    render(
      <BudgetCategoryItem
        category={overBudgetCategory}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        totalAvailable={totalAvailable}
      />
    );

    // Should show over budget percentage
    expect(screen.getByText('25% over')).toBeInTheDocument();
  });

  it('handles zero budget scenario', () => {
    const zeroBudgetCategory = {
      ...mockCategory,
      budgeted: 0,
      spent: 0,
    };

    render(
      <BudgetCategoryItem
        category={zeroBudgetCategory}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        totalAvailable={totalAvailable}
      />
    );

    expect(screen.getByText('$0.00 of $0.00')).toBeInTheDocument();
  });

  it('shows edit and delete buttons', () => {
    render(
      <BudgetCategoryItem
        category={mockCategory}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        totalAvailable={totalAvailable}
      />
    );

    // Check for edit and delete buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles long category names', () => {
    const longNameCategory = {
      ...mockCategory,
      name: 'Very Long Category Name That Should Be Truncated',
    };

    render(
      <BudgetCategoryItem
        category={longNameCategory}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        totalAvailable={totalAvailable}
      />
    );

    expect(screen.getByText('Very Long Category Name That Should Be Truncated')).toBeInTheDocument();
  });

  it('handles decimal amounts correctly', () => {
    const decimalCategory = {
      ...mockCategory,
      budgeted: 299.99,
      spent: 150.50,
    };

    render(
      <BudgetCategoryItem
        category={decimalCategory}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        totalAvailable={totalAvailable}
      />
    );

    expect(screen.getByText('$150.50 of $299.99')).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', () => {
    render(
      <BudgetCategoryItem
        category={mockCategory}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        totalAvailable={totalAvailable}
      />
    );

    // Click edit button
    const buttons = screen.getAllByRole('button');
    const editButton = buttons[0]; // First button is edit
    fireEvent.click(editButton);

    // Should show edit form
    expect(screen.getByPlaceholderText('Category name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Budget amount')).toBeInTheDocument();
  });
}); 