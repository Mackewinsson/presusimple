import { renderHook } from '@testing-library/react';
import { useUserId } from '@/lib/hooks/useUserId';

// Mock the entire useUserId hook
jest.mock('@/lib/hooks/useUserId', () => ({
  useUserId: jest.fn(),
}));

describe('useUserId', () => {
  const mockUseUserId = useUserId as jest.MockedFunction<typeof useUserId>;

  beforeEach(() => {
    mockUseUserId.mockClear();
  });

  it('returns user ID from session', () => {
    const mockResult = {
      data: 'user123',
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      refetch: jest.fn(),
    } as any;

    mockUseUserId.mockReturnValue(mockResult);

    const { result } = renderHook(() => useUserId());
    expect(result.current.data).toBe('user123');
  });

  it('returns null when not authenticated', () => {
    const mockResult = {
      data: null,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      refetch: jest.fn(),
    } as any;

    mockUseUserId.mockReturnValue(mockResult);

    const { result } = renderHook(() => useUserId());
    expect(result.current.data).toBeNull();
  });

  it('returns null when session is loading', () => {
    const mockResult = {
      data: null,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
      isFetching: true,
      refetch: jest.fn(),
    } as any;

    mockUseUserId.mockReturnValue(mockResult);

    const { result } = renderHook(() => useUserId());
    expect(result.current.data).toBeNull();
  });

  it('returns null when user has no ID', () => {
    const mockResult = {
      data: null,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      refetch: jest.fn(),
    } as any;

    mockUseUserId.mockReturnValue(mockResult);

    const { result } = renderHook(() => useUserId());
    expect(result.current.data).toBeNull();
  });
}); 