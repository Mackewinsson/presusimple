const mockGetSubscription = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  dbConnect: jest.fn(),
}));

jest.mock("@/lib/lemonsqueezy", () => ({
  ensureLemonSqueezySetup: jest.fn(),
  getSubscription: (...args: unknown[]) => mockGetSubscription(...args),
}));

const mockFindOne = jest.fn();
jest.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    findOne: (...args: unknown[]) => mockFindOne(...args),
  },
}));

import { POST } from "@/app/api/lemonsqueezy/portal/route";

const createMockRequest = (body: { email?: string }) =>
  ({
    json: async () => body,
  }) as any;

describe("POST /api/lemonsqueezy/portal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindOne.mockReturnValue({
      select: () => ({
        lean: () =>
          Promise.resolve({ lemonSqueezySubscriptionId: "sub_test123" }),
      }),
    });
    mockGetSubscription.mockResolvedValue({
      data: {
        data: {
          attributes: {
            urls: {
              customer_portal: "https://store.lemonsqueezy.com/billing?signed=1",
            },
          },
        },
      },
    });
  });

  it("returns 400 when email is missing", async () => {
    const response = await POST(createMockRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Missing email" });
    expect(mockGetSubscription).not.toHaveBeenCalled();
  });

  it("returns 400 when user has no subscription id", async () => {
    mockFindOne.mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve({ lemonSqueezySubscriptionId: null }),
      }),
    });

    const response = await POST(createMockRequest({ email: "user@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("No billing account");
  });

  it("returns signed customer portal url", async () => {
    const response = await POST(createMockRequest({ email: "user@example.com" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toContain("lemonsqueezy.com/billing");
    expect(mockGetSubscription).toHaveBeenCalledWith("sub_test123");
  });
});
