import { getEffectiveUserTier } from "@/lib/userAccess";

describe("getEffectiveUserTier for feature flags", () => {
  it("returns pro for paid users", () => {
    expect(getEffectiveUserTier({ isPaid: true, plan: "pro" } as any)).toBe("pro");
  });

  it("returns pro for active trial users", () => {
    expect(
      getEffectiveUserTier({
        isPaid: false,
        plan: "pro",
        trialEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      } as any)
    ).toBe("pro");
  });

  it("returns free for expired trial users even when plan is pro", () => {
    expect(
      getEffectiveUserTier({
        isPaid: false,
        plan: "pro",
        trialEnd: new Date("2020-01-01"),
      } as any)
    ).toBe("free");
  });

  it("returns free for legacy pro users without trial or payment", () => {
    expect(
      getEffectiveUserTier({
        isPaid: false,
        plan: "pro",
      } as any)
    ).toBe("free");
  });
});
