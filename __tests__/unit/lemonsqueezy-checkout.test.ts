const mockCreateCheckout = jest.fn();
const mockGetServerSession = jest.fn();

jest.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("@/lib/lemonsqueezy", () => ({
  ensureLemonSqueezySetup: jest.fn(),
  getAppUrl: jest.fn(() => "http://localhost:3000"),
  getStoreId: jest.fn(() => "123"),
  getVariantId: jest.fn(() => "456"),
  isLemonSqueezyCheckoutConfigured: jest.fn(() => true),
  createCheckout: (...args: unknown[]) => mockCreateCheckout(...args),
}));

import { POST } from "@/app/api/lemonsqueezy/checkout/route";
import { isLemonSqueezyCheckoutConfigured } from "@/lib/lemonsqueezy";

const createMockRequest = (body: { locale?: string } = {}) =>
  ({
    json: async () => body,
  }) as any;

describe("POST /api/lemonsqueezy/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { email: "user@example.com" },
    });
    mockCreateCheckout.mockResolvedValue({
      data: {
        data: {
          attributes: {
            url: "https://store.lemonsqueezy.com/checkout/custom/test",
          },
        },
      },
    });
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValueOnce(null);

    const response = await POST(createMockRequest({ locale: "en" }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
    expect(mockCreateCheckout).not.toHaveBeenCalled();
  });

  it("returns 503 when Lemon Squeezy is not configured", async () => {
    jest.mocked(isLemonSqueezyCheckoutConfigured).mockReturnValueOnce(false);

    const response = await POST(createMockRequest({ locale: "en" }));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain("not configured");
    expect(mockCreateCheckout).not.toHaveBeenCalled();
  });

  it("includes /es in redirectUrl when locale is es", async () => {
    await POST(createMockRequest({ locale: "es" }));

    expect(mockCreateCheckout).toHaveBeenCalledTimes(1);
    const options = mockCreateCheckout.mock.calls[0][2];
    expect(options.productOptions.redirectUrl).toContain("/es/budget?checkout=success");
  });

  it("omits /es from redirectUrl when locale is en", async () => {
    await POST(createMockRequest({ locale: "en" }));

    const options = mockCreateCheckout.mock.calls[0][2];
    expect(options.productOptions.redirectUrl).not.toContain("/es");
    expect(options.productOptions.redirectUrl).toContain("/budget?checkout=success");
  });

  it("prefills session email and skips Lemon Squeezy trial", async () => {
    await POST(createMockRequest({}));

    const options = mockCreateCheckout.mock.calls[0][2];
    expect(options.checkoutData.email).toBe("user@example.com");
    expect(options.checkoutData.custom.user_email).toBe("user@example.com");
    expect(options.checkoutOptions.skipTrial).toBe(true);
  });
});
