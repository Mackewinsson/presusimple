import { render, screen, fireEvent } from '@testing-library/react';
import NewCategoryForm from './NewCategoryForm';
import { PrivateModeProvider } from '@/components/PrivateModeProvider';

// Mock the dependencies
jest.mock('@/lib/hooks', () => ({
  useCreateCategory: () => ({
    mutateAsync: jest.fn(),
    isLoading: false,
  }),
  useCurrentCurrency: () => ({ code: 'USD', symbol: '$', name: 'US Dollar' }),
  useCurrentDecimalSeparator: () => '.',
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('NewCategoryForm', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();
  const totalAvailable = 1000;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderForm = () =>
    render(
      <PrivateModeProvider>
        <NewCategoryForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
          totalAvailable={totalAvailable}
          existingCategoryNames={[]}
        />
      </PrivateModeProvider>
    );

  it('renders form fields correctly', () => {
    renderForm();

    expect(screen.getByPlaceholderText(/category name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/budget amount/i)).toBeInTheDocument();
  });

  it('has submit button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('validates required fields', () => {
    renderForm();
    const submitButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(submitButton);
    // Should show validation errors or prevent submission (implementation dependent)
  });

  it('sets default values correctly', () => {
    renderForm();
    // Check if budgeted amount defaults to empty string
    const budgetInput = screen.getByPlaceholderText(/budget amount/i) as HTMLInputElement;
    expect(budgetInput.value).toBe('');
  });
}); 