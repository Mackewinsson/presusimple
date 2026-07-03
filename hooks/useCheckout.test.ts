import { renderHook, act } from "@testing-library/react";
import { useCheckout } from "@/hooks/useCheckout";

const mockUsePathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("useCheckout", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/budget");
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("canCheckout is true when session has email", () => {
    const { result } = renderHook(() => useCheckout());
    expect(result.current.canCheckout).toBe(true);
  });

  it("sends locale 'es' when pathname is /es/...", async () => {
    mockUsePathname.mockReturnValue("/es/budget");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://store.lemonsqueezy.com/checkout/custom/test" }),
    });

    const { result } = renderHook(() => useCheckout());
    await act(async () => {
      result.current.checkout();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/lemonsqueezy/checkout",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body).toEqual({ email: "test@example.com", locale: "es" });
  });

  it("sends locale 'en' when pathname is English", async () => {
    mockUsePathname.mockReturnValue("/budget");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://store.lemonsqueezy.com/checkout/custom/test" }),
    });

    const { result } = renderHook(() => useCheckout());
    await act(async () => {
      result.current.checkout();
    });

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.locale).toBe("en");
  });

  it("sets error when API returns no url", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useCheckout());
    await act(async () => {
      result.current.checkout();
    });

    expect(result.current.error).toBe("Failed to start checkout");
  });

  it("sets error on fetch failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCheckout());
    await act(async () => {
      result.current.checkout();
    });

    expect(result.current.error).toBe("Failed to start checkout");
  });
});
