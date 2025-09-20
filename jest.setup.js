require('@testing-library/jest-dom');
require('jest-canvas-mock');

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'user123',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  })),
}));

// Mock currency queries
jest.mock('@/lib/hooks/useCurrencyQueries', () => ({
  useSelectedCurrency: () => ({
    data: { code: 'USD', symbol: '$', name: 'US Dollar' },
    isLoading: false,
  }),
  useSetCurrency: () => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
  }),
  useCurrentCurrency: () => ({ code: 'USD', symbol: '$', name: 'US Dollar' }),
  currencies: [{ code: 'USD', symbol: '$', name: 'US Dollar' }],
}));

// Mock aggregated hooks
jest.mock('@/lib/hooks', () => {
  const actual = jest.requireActual('@/lib/hooks');
  return {
    __esModule: true,
    ...actual,
    // Ensure currency helpers exist when imported from aggregated hooks
    useSelectedCurrency: () => ({
      data: { code: 'USD', symbol: '$', name: 'US Dollar' },
      isLoading: false,
    }),
    useSetCurrency: () => ({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isLoading: false,
    }),
    useCurrentCurrency: () => ({ code: 'USD', symbol: '$', name: 'US Dollar' }),
    currencies: [{ code: 'USD', symbol: '$', name: 'US Dollar' }],
    useUpdateExpense: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
    useDeleteExpense: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
  };
});

// Mock global fetch for hooks relying on API routes
global.fetch = jest.fn((input, init) => {
  const url = typeof input === 'string' ? input : input.toString();
  
  if (url.startsWith('/api/users?email=')) {
    // Return a single user in list for read queries
    return Promise.resolve({
      ok: true,
      json: async () => [{ _id: 'user123', email: url.split('=')[1] }],
    });
  }
  
  if (url === '/api/users' && init?.method === 'POST') {
    const body = init?.body ? JSON.parse(init.body) : {};
    return Promise.resolve({
      ok: true,
      json: async () => ({ _id: 'user123', ...body }),
    });
  }
  
  if (url === '/api/users' && init?.method === 'PATCH') {
    return Promise.resolve({ 
      ok: true, 
      json: async () => ({ success: true }) 
    });
  }
  
  // Default response for other API calls
  return Promise.resolve({ 
    ok: true, 
    json: async () => ({}) 
  });
});

// Mock Next.js server module to avoid Request global issues in API route imports during tests
jest.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    json: (data, init) => ({
      json: async () => data,
      status: (init && init.status) || 200,
    }),
  },
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return require('react').createElement('a', { href, ...props }, children);
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => require('react').createElement('div', props, children),
    span: ({ children, ...props }) => require('react').createElement('span', props, children),
  },
}));

// Mock ResizeObserver for Recharts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia for ThemeProvider/ThemeToggle
if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  };
} 