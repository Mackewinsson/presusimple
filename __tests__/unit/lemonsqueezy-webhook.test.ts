const mockFindOneAndUpdate = jest.fn();
const mockGetSubscription = jest.fn();
const mockWebhookFindOne = jest.fn();
const mockWebhookCreate = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  dbConnect: jest.fn(),
}));

jest.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    findOneAndUpdate: (...args: unknown[]) => mockFindOneAndUpdate(...args),
  },
}));

jest.mock("@/models/WebhookEvent", () => ({
  __esModule: true,
  default: {
    findOne: (...args: unknown[]) => mockWebhookFindOne(...args),
    create: (...args: unknown[]) => mockWebhookCreate(...args),
  },
}));

jest.mock("@/lib/lemonsqueezy", () => {
  const actual = jest.requireActual("@/lib/lemonsqueezy");
  return {
    ...actual,
    ensureLemonSqueezySetup: jest.fn(),
    getSubscription: (...args: unknown[]) => mockGetSubscription(...args),
    getWebhookSecret: jest.fn(() => "test-secret"),
    isLemonSqueezyWebhookConfigured: jest.fn(() => true),
  };
});

import crypto from "node:crypto";
import { POST } from "@/app/api/lemonsqueezy/webhook/route";

const signPayload = (body: string) =>
  crypto.createHmac("sha256", "test-secret").update(body).digest("hex");

const createMockRequest = (body: string, signature?: string) =>
  ({
    text: async () => body,
    headers: {
      get: (name: string) => (name === "X-Signature" ? signature ?? signPayload(body) : null),
    },
  }) as any;

describe("POST /api/lemonsqueezy/webhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWebhookFindOne.mockReturnValue({ lean: () => Promise.resolve(null) });
    mockWebhookCreate.mockResolvedValue({});
    mockFindOneAndUpdate.mockResolvedValue({ email: "user@example.com" });
  });

  it("rejects invalid signatures", async () => {
    const body = JSON.stringify({ meta: { event_name: "subscription_created" }, data: { id: "1" } });
    const response = await POST(createMockRequest(body, "bad-signature"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("signature");
  });

  it("syncs subscription events using custom_data fallback email", async () => {
    const payload = {
      meta: {
        event_name: "subscription_created",
        custom_data: { user_email: "user@example.com" },
      },
      data: {
        type: "subscriptions",
        id: "sub_123",
        attributes: {
          status: "active",
          customer_id: 42,
        },
      },
    };
    const body = JSON.stringify(payload);

    const response = await POST(createMockRequest(body));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ received: true });
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { email: "user@example.com" },
      expect.objectContaining({
        isPaid: true,
        plan: "pro",
        lemonSqueezySubscriptionId: "sub_123",
      })
    );
    expect(mockWebhookCreate).toHaveBeenCalled();
  });

  it("downgrades user on order_refunded using custom_data email", async () => {
    const payload = {
      meta: {
        event_name: "order_refunded",
        custom_data: { user_email: "user@example.com" },
      },
      data: {
        type: "orders",
        id: "order_123",
        attributes: {},
      },
    };
    const body = JSON.stringify(payload);

    const response = await POST(createMockRequest(body));

    expect(response.status).toBe(200);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { email: "user@example.com" },
      expect.objectContaining({
        isPaid: false,
        plan: "free",
      })
    );
  });

  it("skips duplicate events via idempotency", async () => {
    mockWebhookFindOne.mockReturnValue({
      lean: () => Promise.resolve({ eventId: "subscription_created:sub_123" }),
    });

    const payload = {
      meta: { event_name: "subscription_created" },
      data: {
        type: "subscriptions",
        id: "sub_123",
        attributes: {
          status: "active",
          user_email: "user@example.com",
          customer_id: 42,
        },
      },
    };
    const body = JSON.stringify(payload);

    const response = await POST(createMockRequest(body));

    expect(response.status).toBe(200);
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    expect(mockWebhookCreate).not.toHaveBeenCalled();
  });
});
