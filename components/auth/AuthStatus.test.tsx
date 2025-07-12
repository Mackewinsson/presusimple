import { render, screen, fireEvent } from '@testing-library/react';
import AuthStatus from './AuthStatus';

describe('AuthStatus', () => {
  it('renders sign in button when user is not authenticated', () => {
    render(<AuthStatus user={null} />);
    
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/auth/login');
  });

  it('renders user avatar and dropdown when user is authenticated', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://example.com/avatar.jpg',
    };

    render(<AuthStatus user={mockUser} />);
    
    // Check if user initials are shown as fallback (since image might not load in test)
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('has clickable avatar button for authenticated user', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    render(<AuthStatus user={mockUser} />);
    
    // Check that the avatar button exists and is clickable
    const avatarButton = screen.getByRole('button');
    expect(avatarButton).toBeInTheDocument();
    expect(avatarButton).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('handles user without image', () => {
    const mockUser = {
      name: 'Jane Smith',
      email: 'jane@example.com',
    };

    render(<AuthStatus user={mockUser} />);
    
    // Should show user initials as fallback
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('handles user with single name', () => {
    const mockUser = {
      name: 'Alice',
      email: 'alice@example.com',
    };

    render(<AuthStatus user={mockUser} />);
    
    // Should show first letter of name
    expect(screen.getByText('A')).toBeInTheDocument();
  });
}); 