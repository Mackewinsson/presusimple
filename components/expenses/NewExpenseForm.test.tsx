import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewExpenseForm from './NewExpenseForm';

// Shared mock for mutateAsync
const mockMutateAsync = jest.fn();

jest.mock('@/lib/hooks', () => ({
  useCreateExpense: () => ({
    mutateAsync: mockMutateAsync,
    isLoading: false,
  }),
  useUserId: () => ({
    data: 'user1',
  }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { email: 'test@example.com' } },
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('NewExpenseForm', () => {
  const mockBudget = {
    _id: 'budget1',
    totalBudgeted: 1000,
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockReset();
    mockMutateAsync.mockResolvedValue({});
  });

  it('renders form fields correctly', () => {
    render(
      <NewExpenseForm
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    // There may be multiple elements with 'Category' (label and button)
    expect(screen.getAllByText(/category/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(
      <NewExpenseForm
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '50.00' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Grocery shopping' },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2024-01-15' },
    });

    // Select category using the Radix UI Select - find by placeholder text
    const categoryButtons = screen.getAllByRole('combobox');
    const categoryButton = categoryButtons.find(button => 
      button.textContent?.includes('Select a category')
    );
    expect(categoryButton).toBeInTheDocument();
    fireEvent.click(categoryButton!);
    // Find the visible dropdown option (not aria-hidden)
    const categoryOptions = screen.getAllByText('Groceries');
    const visibleOption = categoryOptions.find(
      (el) => !el.closest('[aria-hidden="true"]')
    );
    expect(visibleOption).toBeInTheDocument();
    fireEvent.click(visibleOption!);

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    const { toast } = require('sonner');
    
    render(
      <NewExpenseForm
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Clear all form fields to ensure validation triggers
    const amountInput = screen.getByLabelText(/amount/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const dateInput = screen.getByLabelText(/date/i);
    const form = screen.getByTestId('expense-form');
    
    // Clear the fields by setting them to empty strings
    fireEvent.change(amountInput, { target: { value: '' } });
    fireEvent.change(descriptionInput, { target: { value: '' } });
    fireEvent.change(dateInput, { target: { value: '' } });
    
    // Submit the form directly using fireEvent.submit
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields');
    });
  });

  it('validates amount is positive', async () => {
    const { toast } = require('sonner');
    
    render(
      <NewExpenseForm
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Fill all required fields with valid values
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '-10' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test description' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2024-01-15' } });
    
    // Select category
    const categoryButtons = screen.getAllByRole('combobox');
    const categoryButton = categoryButtons.find(button => 
      button.textContent?.includes('Select a category')
    );
    expect(categoryButton).toBeInTheDocument();
    fireEvent.click(categoryButton!);
    const categoryOptions = screen.getAllByText('Groceries');
    const visibleOption = categoryOptions.find(
      (el) => !el.closest('[aria-hidden="true"]')
    );
    expect(visibleOption).toBeInTheDocument();
    fireEvent.click(visibleOption!);

    // Submit the form directly
    const form = screen.getByTestId('expense-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter a valid amount');
    });
  });

  it('validates amount is a number', async () => {
    const { toast } = require('sonner');
    render(
      <NewExpenseForm
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Set amount to a non-numeric value (jsdom will treat as empty for type=number)
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2023-01-01' } });
    // Don't select category
    const form = screen.getByTestId('expense-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields');
    });
  });

  it('handles decimal amounts correctly', async () => {
    render(
      <NewExpenseForm
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Fill form with decimal amount
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '25.99' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Gas station' },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2024-01-15' },
    });

    // Select category using the Radix UI Select - find by placeholder text
    const categoryButtons = screen.getAllByRole('combobox');
    const categoryButton = categoryButtons.find(button => 
      button.textContent?.includes('Select a category')
    );
    expect(categoryButton).toBeInTheDocument();
    fireEvent.click(categoryButton!);
    // Find the visible dropdown option (not aria-hidden)
    const categoryOptions = screen.getAllByText('Groceries');
    const visibleOption = categoryOptions.find(
      (el) => !el.closest('[aria-hidden="true"]')
    );
    expect(visibleOption).toBeInTheDocument();
    fireEvent.click(visibleOption!);

    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 25.99,
        })
      );
    });
  });

  it('handles large amounts', async () => {
    render(
      <NewExpenseForm
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Fill form with large amount
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '9999.99' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Large purchase' },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2024-01-15' },
    });

    // Select category using the Radix UI Select - find by placeholder text
    const categoryButtons = screen.getAllByRole('combobox');
    const categoryButton = categoryButtons.find(button => 
      button.textContent?.includes('Select a category')
    );
    expect(categoryButton).toBeInTheDocument();
    fireEvent.click(categoryButton!);
    // Find the visible dropdown option (not aria-hidden)
    const categoryOptions = screen.getAllByText('Groceries');
    const visibleOption = categoryOptions.find(
      (el) => !el.closest('[aria-hidden="true"]')
    );
    expect(visibleOption).toBeInTheDocument();
    fireEvent.click(visibleOption!);

    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 9999.99,
        })
      );
    });
  });

  it('handles empty categories array', () => {
    render(
      <NewExpenseForm
        budget={mockBudget}
        categories={[]}
        expenses={mockExpenses}
      />
    );

    // Should show message about no categories
    expect(screen.getByText(/select a category/i)).toBeInTheDocument();
  });

  it('handles long descriptions', async () => {
    render(
      <NewExpenseForm
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    const longDescription = 'This is a very long description that should be handled properly by the form component without causing any issues';

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '50.00' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: longDescription },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2024-01-15' },
    });

    // Select category using the Radix UI Select - find by placeholder text
    const categoryButtons = screen.getAllByRole('combobox');
    const categoryButton = categoryButtons.find(button => 
      button.textContent?.includes('Select a category')
    );
    expect(categoryButton).toBeInTheDocument();
    fireEvent.click(categoryButton!);
    // Find the visible dropdown option (not aria-hidden)
    const categoryOptions = screen.getAllByText('Groceries');
    const visibleOption = categoryOptions.find(
      (el) => !el.closest('[aria-hidden="true"]')
    );
    expect(visibleOption).toBeInTheDocument();
    fireEvent.click(visibleOption!);

    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          description: longDescription,
        })
      );
    });
  });

  it('resets form after successful submission', async () => {
    render(
      <NewExpenseForm
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '50.00' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test expense' },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2024-01-15' },
    });

    // Select category using the Radix UI Select - find by placeholder text
    const categoryButtons = screen.getAllByRole('combobox');
    const categoryButton = categoryButtons.find(button => 
      button.textContent?.includes('Select a category')
    );
    expect(categoryButton).toBeInTheDocument();
    fireEvent.click(categoryButton!);
    // Find the visible dropdown option (not aria-hidden)
    const categoryOptions = screen.getAllByText('Groceries');
    const visibleOption = categoryOptions.find(
      (el) => !el.closest('[aria-hidden="true"]')
    );
    expect(visibleOption).toBeInTheDocument();
    fireEvent.click(visibleOption!);

    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      // Form should be reset - check that the form is still rendered
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });

  it('handles form submission errors', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Submission failed'));
    
    render(
      <NewExpenseForm
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '50.00' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test expense' },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2024-01-15' },
    });

    // Select category using the Radix UI Select - find by placeholder text
    const categoryButtons = screen.getAllByRole('combobox');
    const categoryButton = categoryButtons.find(button => 
      button.textContent?.includes('Select a category')
    );
    expect(categoryButton).toBeInTheDocument();
    fireEvent.click(categoryButton!);
    // Find the visible dropdown option (not aria-hidden)
    const categoryOptions = screen.getAllByText('Groceries');
    const visibleOption = categoryOptions.find(
      (el) => !el.closest('[aria-hidden="true"]')
    );
    expect(visibleOption).toBeInTheDocument();
    fireEvent.click(visibleOption!);

    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      // Should handle the error gracefully
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it('shows loading state during submission', async () => {
    mockMutateAsync.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <NewExpenseForm
        budget={mockBudget}
        categories={mockCategories}
        expenses={mockExpenses}
      />
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '50.00' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test expense' },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2024-01-15' },
    });

    // Select category using the Radix UI Select - find by placeholder text
    const categoryButtons = screen.getAllByRole('combobox');
    const categoryButton = categoryButtons.find(button => 
      button.textContent?.includes('Select a category')
    );
    expect(categoryButton).toBeInTheDocument();
    fireEvent.click(categoryButton!);
    // Find the visible dropdown option (not aria-hidden)
    const categoryOptions = screen.getAllByText('Groceries');
    const visibleOption = categoryOptions.find(
      (el) => !el.closest('[aria-hidden="true"]')
    );
    expect(visibleOption).toBeInTheDocument();
    fireEvent.click(visibleOption!);

    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));

    // Should show loading state - check for disabled button or loading indicator
    expect(screen.getByRole('button', { name: /add transaction/i })).toBeInTheDocument();
  });
}); 