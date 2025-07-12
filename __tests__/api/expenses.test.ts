import { GET, POST } from '@/app/api/expenses/route';

// Mock NextRequest
const createMockRequest = (url: string, method: string = 'GET', body?: any) => {
  return {
    url,
    method,
    json: async () => body || {},
    nextUrl: new URL(url),
    headers: new Map(),
  } as any;
};

// Mock the database connection
jest.mock('@/lib/mongoose', () => ({
  dbConnect: jest.fn(),
}));

// Mock the Expense model
const mockExpense = {
  _id: 'exp1',
  userId: 'user1',
  categoryId: 'cat1',
  amount: 50.00,
  description: 'Grocery shopping',
  date: '2024-01-15',
  type: 'expense' as const,
  save: jest.fn().mockResolvedValue({
    _id: 'exp1',
    userId: 'user1',
    categoryId: 'cat1',
    amount: 50.00,
    description: 'Grocery shopping',
    date: '2024-01-15',
    type: 'expense',
  }),
};

jest.mock('@/models/Expense', () => ({
  find: jest.fn().mockResolvedValue([mockExpense]),
  findOne: jest.fn().mockResolvedValue(mockExpense),
  findOneAndUpdate: jest.fn().mockResolvedValue(mockExpense),
  findOneAndDelete: jest.fn().mockResolvedValue(mockExpense),
  create: jest.fn().mockResolvedValue(mockExpense),
}));

// NOTE: Skipped due to incompatibility with Jest/node environment (Next.js API routes require edge runtime or web APIs)
describe.skip('/api/expenses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns expenses for user', async () => {
      const request = createMockRequest('http://localhost:3000/api/expenses?user=user1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockExpense]);
    });

    it('returns all expenses when no user is provided', async () => {
      const request = createMockRequest('http://localhost:3000/api/expenses');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockExpense]);
    });
  });

  describe('POST', () => {
    it('creates a new expense successfully', async () => {
      const expenseData = {
        user: 'user1',
        budget: 'budget1',
        categoryId: 'cat1',
        amount: 25.00,
        description: 'Gas',
        date: '2024-01-16',
        type: 'expense',
      };

      const request = createMockRequest('http://localhost:3000/api/expenses', 'POST', expenseData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.description).toBe('Gas');
    });

    it('returns error when required fields are missing', async () => {
      const expenseData = {
        user: 'user1',
        amount: 25.00,
        // Missing categoryId and description
      };

      const request = createMockRequest('http://localhost:3000/api/expenses', 'POST', expenseData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: user, budget, categoryId, amount, description, date, type');
    });
  });


}); 