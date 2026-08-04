const mockFindById = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  dbConnect: jest.fn(),
}));

jest.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    findById: (...args: unknown[]) => mockFindById(...args),
  },
}));

jest.mock("@/lib/ai/budget-extract", () => ({
  extractBudgetFromDescription: jest.fn(),
}));

import { POST } from "@/app/api/budgets/ai-create/route";

const createMockRequest = (body: Record<string, unknown>) =>
  ({
    json: async () => body,
  }) as any;

describe("POST /api/budgets/ai-create", () => {
  const originalGeminiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    mockFindById.mockResolvedValue({ plan: "free", isPaid: false });
  });

  afterAll(() => {
    process.env.GEMINI_API_KEY = originalGeminiKey;
  });

  it("returns 403 when user lacks aiBudgeting access", async () => {
    const response = await POST(
      createMockRequest({
        description: "I earn 5000 and spend 2000 on rent and 500 on food",
        userId: "user123",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("Pro subscription required");
    expect(mockFindById).toHaveBeenCalledWith("user123");
  });
});
