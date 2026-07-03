const mockCreateCheckout = jest.fn();

jest.mock("@/lib/lemonsqueezy", () => ({
  ensureLemonSqueezySetup: jest.fn(),
  getAppUrl: jest.fn(() => "http://localhost:3000"),
  getStoreId: jest.fn(() => "123"),
  getVariantId: jest.fn(() => "456"),
  isLemonSqueezyConfigured: jest.fn(() => true),
  createCheckout: (...args: unknown[]) => mockCreateCheckout(...args),
}));

import { POST } from "@/app/api/lemonsqueezy/checkout/route";
import { isLemonSqueezyConfigured } from "@/lib/lemonsqueezy";

const createMockRequest = (body: { email?: string; locale?: string }) =>
  ({
    json: async () => body,
  }) as any;

describe("POST /api/lemonsqueezy/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("returns 503 when Lemon Squeezy is not configured", async () => {
    jest.mocked(isLemonSqueezyConfigured).mockReturnValueOnce(false);

    const response = await POST(
      createMockRequest({ email: "user@example.com" })
    );
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain("not configured");
    expect(mockCreateCheckout).not.toHaveBeenCalled();
  });

  it("returns 400 when email is missing", async () => {
    const response = await POST(createMockRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Missing email" });
    expect(mockCreateCheckout).not.toHaveBeenCalled();
  });

  it("includes /es in redirectUrl when locale is es", async () => {
    await POST(
      createMockRequest({ email: "user@example.com", locale: "es" })
    );

    expect(mockCreateCheckout).toHaveBeenCalledTimes(1);
    const options = mockCreateCheckout.mock.calls[0][2];
    expect(options.productOptions.redirectUrl).toContain("/es/budget?checkout=success");
  });

  it("omits /es from redirectUrl when locale is en", async () => {
    await POST(
      createMockRequest({ email: "user@example.com", locale: "en" })
    );

    const options = mockCreateCheckout.mock.calls[0][2];
    expect(options.productOptions.redirectUrl).not.toContain("/es");
    expect(options.productOptions.redirectUrl).toContain("/budget?checkout=success");
  });

  it("prefills email and skips Lemon Squeezy trial", async () => {
    await POST(createMockRequest({ email: "user@example.com" }));

    const options = mockCreateCheckout.mock.calls[0][2];
    expect(options.checkoutData.email).toBe("user@example.com");
    expect(options.checkoutOptions.skipTrial).toBe(true);
  });
});
