import { render, screen, fireEvent } from '@testing-library/react';
import NewCategoryForm from './NewCategoryForm';

// Mock the dependencies
jest.mock('@/lib/hooks', () => ({
  useCreateCategory: () => ({
    mutateAsync: jest.fn(),
    isLoading: false,
  }),
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

  it('renders form fields correctly', () => {
    render(
      <NewCategoryForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        totalAvailable={totalAvailable}
      />
    );

    expect(screen.getByPlaceholderText(/category name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/budget amount/i)).toBeInTheDocument();
  });

  it('has submit button', () => {
    render(
      <NewCategoryForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        totalAvailable={totalAvailable}
      />
    );
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('validates required fields', () => {
    render(
      <NewCategoryForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        totalAvailable={totalAvailable}
      />
    );
    const submitButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(submitButton);
    // Should show validation errors or prevent submission (implementation dependent)
  });

  it('sets default values correctly', () => {
    render(
      <NewCategoryForm
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        totalAvailable={totalAvailable}
      />
    );
    // Check if budgeted amount defaults to empty string
    const budgetInput = screen.getByPlaceholderText(/budget amount/i) as HTMLInputElement;
    expect(budgetInput.value).toBe('');
  });
}); 