const mockCheckoutSessionsCreate = jest.fn();
jest.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: (...args: unknown[]) => mockCheckoutSessionsCreate(...args),
      },
    },
  },
  getPriceId: jest.fn(() => "price_test123"),
}));

import { POST } from "@/app/api/stripe/checkout/route";

const createMockRequest = (body: { email?: string; locale?: string }) => ({
  json: async () => body,
} as any);

describe("POST /api/stripe/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/session",
    });
  });

  it("returns 400 when email is missing", async () => {
    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Missing email" });
    expect(mockCheckoutSessionsCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when only locale is provided", async () => {
    const request = createMockRequest({ locale: "es" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Missing email" });
    expect(mockCheckoutSessionsCreate).not.toHaveBeenCalled();
  });

  it("includes /es in success_url and cancel_url when locale is es", async () => {
    const request = createMockRequest({
      email: "user@example.com",
      locale: "es",
    });
    await POST(request);

    expect(mockCheckoutSessionsCreate).toHaveBeenCalledTimes(1);
    const callArg = mockCheckoutSessionsCreate.mock.calls[0][0];
    expect(callArg.success_url).toContain("/es/budget");
    expect(callArg.cancel_url).toContain("/es/budget");
  });

  it("omits /es from URLs when locale is en", async () => {
    const request = createMockRequest({
      email: "user@example.com",
      locale: "en",
    });
    await POST(request);

    const callArg = mockCheckoutSessionsCreate.mock.calls[0][0];
    expect(callArg.success_url).not.toContain("/es");
    expect(callArg.cancel_url).not.toContain("/es");
    expect(callArg.success_url).toContain("/budget");
    expect(callArg.cancel_url).toContain("/budget");
  });

  it("omits /es from URLs when locale is absent", async () => {
    const request = createMockRequest({ email: "user@example.com" });
    await POST(request);

    const callArg = mockCheckoutSessionsCreate.mock.calls[0][0];
    expect(callArg.success_url).not.toContain("/es");
    expect(callArg.cancel_url).not.toContain("/es");
  });
});
