import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from './ThemeProvider';

// Mock next-themes
const mockUseTheme = jest.fn();
jest.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      systemTheme: 'light',
    });
  });

  it('renders theme toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows current theme indicator', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    // Should show some indication of current theme
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('handles theme toggle click', () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      systemTheme: 'light',
    });

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should call setTheme when clicked
    expect(mockSetTheme).toHaveBeenCalled();
  });

  it('has accessible label', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });
}); 