import {
  getEffectiveUserTier,
  hasAccess,
  hasEffectiveProAccess,
  getUserPlan,
  getAvailableFeatures,
  getProFeatures,
} from "@/lib/userAccess";
import { FEATURES, FeatureKey } from "@/lib/features";

const mockUserFree = { plan: "free" } as any;
const mockUserPro = { plan: "pro", isPaid: true } as any;
const mockUserExpiredTrial = {
  plan: "pro",
  isPaid: false,
  trialEnd: new Date("2020-01-01"),
} as any;
const mockUserActiveTrial = {
  plan: "pro",
  isPaid: false,
  trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
} as any;
const mockUserManualPro = { plan: "pro", isPaid: false } as any;

describe("userAccess helpers", () => {
  it("getUserPlan returns effective tier", () => {
    expect(getUserPlan(mockUserPro)).toBe("pro");
    expect(getUserPlan(mockUserFree)).toBe("free");
    expect(getUserPlan(null)).toBe("free");
    expect(getUserPlan(mockUserExpiredTrial)).toBe("free");
    expect(getUserPlan(mockUserActiveTrial)).toBe("pro");
    expect(getUserPlan(mockUserManualPro)).toBe("pro");
  });

  it("getEffectiveUserTier downgrades expired trials even when plan is pro", () => {
    expect(getEffectiveUserTier(mockUserExpiredTrial)).toBe("free");
    expect(hasEffectiveProAccess(mockUserExpiredTrial)).toBe(false);
  });

  it("hasAccess reflects feature plan matrix using effective tier", () => {
    const proOnly = Object.entries(FEATURES).find(
      ([, f]) => f.plans.includes("pro" as any) && !f.plans.includes("free" as any)
    )![0] as FeatureKey;
    const freeFeature = Object.entries(FEATURES).find(([, f]) =>
      f.plans.includes("free" as any)
    )![0] as FeatureKey;

    expect(hasAccess(mockUserFree, freeFeature)).toBe(true);
    expect(hasAccess(mockUserFree, proOnly)).toBe(false);
    expect(hasAccess(mockUserPro, proOnly)).toBe(true);
    expect(hasAccess(mockUserExpiredTrial, proOnly)).toBe(false);
    expect(hasAccess(mockUserActiveTrial, proOnly)).toBe(true);
  });

  it("getAvailableFeatures returns features for effective tier", () => {
    const freeFeatures = getAvailableFeatures(mockUserFree);
    const proFeatures = getAvailableFeatures(mockUserPro);
    const expiredTrialFeatures = getAvailableFeatures(mockUserExpiredTrial);

    expect(freeFeatures.length).toBeGreaterThan(0);
    expect(proFeatures.length).toBeGreaterThan(freeFeatures.length);
    expect(expiredTrialFeatures.length).toBe(freeFeatures.length);
  });

  it("getProFeatures returns only pro-only features", () => {
    const proOnly = getProFeatures();
    expect(proOnly.length).toBeGreaterThan(0);
    for (const key of proOnly) {
      expect(FEATURES[key].plans.includes("pro" as any)).toBe(true);
      expect(FEATURES[key].plans.includes("free" as any)).toBe(false);
    }
  });
});
