const mockBillingPortalSessionsCreate = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  dbConnect: jest.fn(),
}));

jest.mock("@/lib/stripe", () => ({
  stripe: {
    billingPortal: {
      sessions: {
        create: (...args: unknown[]) =>
          mockBillingPortalSessionsCreate(...args),
      },
    },
  },
}));

const mockFindOne = jest.fn();
jest.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    findOne: (...args: unknown[]) => mockFindOne(...args),
  },
}));

import { POST } from "@/app/api/stripe/portal/route";

const createMockRequest = (body: { email?: string; locale?: string }) => ({
  json: async () => body,
} as any);

describe("POST /api/stripe/portal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindOne.mockReturnValue({
      select: () => ({
        lean: () =>
          Promise.resolve({ stripeCustomerId: "cus_test123" }),
      }),
    });
    mockBillingPortalSessionsCreate.mockResolvedValue({
      url: "https://billing.stripe.com/session",
    });
  });

  it("returns 400 when email is missing", async () => {
    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Missing email" });
    expect(mockBillingPortalSessionsCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when no billing account found", async () => {
    mockFindOne.mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve(null),
      }),
    });

    const request = createMockRequest({ email: "user@example.com" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("No billing account");
    expect(mockBillingPortalSessionsCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when user has no stripeCustomerId", async () => {
    mockFindOne.mockReturnValue({
      select: () => ({
        lean: () =>
          Promise.resolve({ stripeCustomerId: null }),
      }),
    });

    const request = createMockRequest({ email: "user@example.com" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("No billing account");
  });

  it("includes /es in return_url when locale is es", async () => {
    const request = createMockRequest({
      email: "user@example.com",
      locale: "es",
    });
    await POST(request);

    expect(mockBillingPortalSessionsCreate).toHaveBeenCalledTimes(1);
    const callArg = mockBillingPortalSessionsCreate.mock.calls[0][0];
    expect(callArg.return_url).toContain("/es/budget/settings");
  });

  it("omits /es from return_url when locale is absent or en", async () => {
    const request = createMockRequest({ email: "user@example.com" });
    await POST(request);

    const callArg = mockBillingPortalSessionsCreate.mock.calls[0][0];
    expect(callArg.return_url).not.toContain("/es");
    expect(callArg.return_url).toContain("/budget/settings");
  });
});
