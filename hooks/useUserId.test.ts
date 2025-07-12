import { renderHook, act } from '@testing-library/react';
import { useUserId } from '@/lib/hooks/useUserId';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'user123',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  }),
}));

describe('useUserId', () => {
  it('returns user ID from session', () => {
    const { result } = renderHook(() => useUserId());

    expect(result.current).toBe('user123');
  });

  it('returns null when not authenticated', () => {
    jest.mocked(require('next-auth/react').useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useUserId());

    expect(result.current).toBeNull();
  });

  it('returns null when session is loading', () => {
    jest.mocked(require('next-auth/react').useSession).mockReturnValue({
      data: null,
      status: 'loading',
    });

    const { result } = renderHook(() => useUserId());

    expect(result.current).toBeNull();
  });

  it('returns null when user has no ID', () => {
    jest.mocked(require('next-auth/react').useSession).mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useUserId());

    expect(result.current).toBeNull();
  });
}); 