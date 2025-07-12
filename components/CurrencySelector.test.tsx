import { render, screen } from '@testing-library/react';
import CurrencySelector from './CurrencySelector';

// Mock the dependencies
jest.mock('@/lib/hooks', () => ({
  useSelectedCurrency: () => ({
    data: { code: 'USD', name: 'US Dollar', symbol: '$' },
  }),
  useSetCurrency: () => ({
    mutate: jest.fn(),
    isLoading: false,
  }),
  currencies: [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ],
}));

describe('CurrencySelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders currency selector correctly', () => {
    render(<CurrencySelector />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays current currency', () => {
    render(<CurrencySelector />);

    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('shows currency symbol', () => {
    render(<CurrencySelector />);

    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    jest.doMock('@/lib/hooks', () => ({
      useSelectedCurrency: () => ({
        data: undefined,
        isLoading: true,
      }),
      useSetCurrency: () => ({
        mutate: jest.fn(),
        isLoading: false,
      }),
      currencies: [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
      ],
    }));

    render(<CurrencySelector />);

    // Should show default currency when loading
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('handles empty currency list', () => {
    jest.doMock('@/lib/hooks', () => ({
      useSelectedCurrency: () => ({
        data: { code: 'USD', name: 'US Dollar', symbol: '$' },
      }),
      useSetCurrency: () => ({
        mutate: jest.fn(),
        isLoading: false,
      }),
      currencies: [],
    }));

    render(<CurrencySelector />);

    // Should handle empty list gracefully
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('handles missing current currency', () => {
    jest.doMock('@/lib/hooks', () => ({
      useSelectedCurrency: () => ({
        data: null,
      }),
      useSetCurrency: () => ({
        mutate: jest.fn(),
        isLoading: false,
      }),
      currencies: [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
      ],
    }));

    render(<CurrencySelector />);

    // Should show default currency
    expect(screen.getByText('USD')).toBeInTheDocument();
  });
}); 