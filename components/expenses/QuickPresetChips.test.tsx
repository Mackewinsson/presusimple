import { render, screen, fireEvent } from '@testing-library/react';
import { QuickPresetChips } from './QuickPresetChips';

describe('QuickPresetChips', () => {
  const mockCategories = [
    { _id: 'cat1', name: 'Food & Dining' },
    { _id: 'cat2', name: 'Transportation' },
    { _id: 'cat3', name: 'Groceries' },
  ];

  const mockOnSelectPreset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders quick preset chips', () => {
    render(
      <QuickPresetChips
        categories={mockCategories}
        onSelectPreset={mockOnSelectPreset}
      />
    );

    expect(screen.getByText(/Quick Presets/i)).toBeInTheDocument();
    expect(screen.getByText(/Coffee/i)).toBeInTheDocument();
    expect(screen.getByText(/Lunch/i)).toBeInTheDocument();
    expect(screen.getByText(/Transit/i)).toBeInTheDocument();
    expect(screen.getByText(/Groceries/i)).toBeInTheDocument();
  });

  it('triggers onSelectPreset when a preset chip is clicked', () => {
    render(
      <QuickPresetChips
        categories={mockCategories}
        onSelectPreset={mockOnSelectPreset}
      />
    );

    const coffeeChip = screen.getByText(/Coffee/i);
    fireEvent.click(coffeeChip);

    expect(mockOnSelectPreset).toHaveBeenCalledTimes(1);
    expect(mockOnSelectPreset).toHaveBeenCalledWith({
      description: 'Coffee',
      amount: '3.5',
      categoryId: 'cat1', // Matched 'drinks/food' or first category
    });
  });
});
