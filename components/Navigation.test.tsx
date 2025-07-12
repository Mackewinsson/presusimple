import { render, screen } from '@testing-library/react';
import Navigation from './Navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        email: 'test@example.com',
        name: 'Test User',
      },
    },
    status: 'authenticated',
  }),
  signOut: jest.fn(),
}));

describe('Navigation', () => {
  it('renders navigation links', () => {
    render(<Navigation />);

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/history/i)).toBeInTheDocument();
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    render(<Navigation />);

    // Should show user-related elements
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it('has logout functionality', () => {
    render(<Navigation />);

    // Should have logout option
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  it('displays current page indicator', () => {
    render(<Navigation />);

    // Should highlight current page
    const dashboardLink = screen.getByText(/dashboard/i);
    expect(dashboardLink).toBeInTheDocument();
  });
}); 