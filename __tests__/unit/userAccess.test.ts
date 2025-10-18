import { hasAccess, getUserPlan, getAvailableFeatures, getProFeatures } from "@/lib/userAccess";
import { FEATURES, FeatureKey } from "@/lib/features";

const mockUserFree = { plan: "free" } as any;
const mockUserPro = { plan: "pro" } as any;

describe("userAccess helpers", () => {
  it("getUserPlan returns user plan or free by default", () => {
    expect(getUserPlan(mockUserPro)).toBe("pro");
    expect(getUserPlan(mockUserFree)).toBe("free");
    expect(getUserPlan(null)).toBe("free");
  });

  it("hasAccess reflects feature plan matrix", () => {
    // Pick one pro-only feature and one available for free
    const proOnly = Object.entries(FEATURES).find(([, f]) => f.plans.includes("pro" as any) && !f.plans.includes("free" as any))![0] as FeatureKey;
    const freeFeature = Object.entries(FEATURES).find(([, f]) => f.plans.includes("free" as any))![0] as FeatureKey;

    expect(hasAccess(mockUserFree, freeFeature)).toBe(true);
    expect(hasAccess(mockUserFree, proOnly)).toBe(false);
    expect(hasAccess(mockUserPro, proOnly)).toBe(true);
  });

  it("getAvailableFeatures returns features for current plan", () => {
    const freeFeatures = getAvailableFeatures(mockUserFree);
    const proFeatures = getAvailableFeatures(mockUserPro);

    expect(freeFeatures.length).toBeGreaterThan(0);
    expect(proFeatures.length).toBeGreaterThan(freeFeatures.length);
  });

  it("getProFeatures returns only pro-only features", () => {
    const proOnly = getProFeatures();
    expect(proOnly.length).toBeGreaterThan(0);
    // Every listed feature should be in FEATURES and not available for free
    for (const key of proOnly) {
      expect(FEATURES[key].plans.includes("pro" as any)).toBe(true);
      expect(FEATURES[key].plans.includes("free" as any)).toBe(false);
    }
  });
});

