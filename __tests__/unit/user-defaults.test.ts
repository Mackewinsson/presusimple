import { getEffectiveUserTier } from "@/lib/userAccess";
import {
  CLIENT_INJECTABLE_BILLING_FIELDS,
  DEFAULT_SIGNUP_PLAN,
  SIGNUP_TRIAL_MS,
  USER_PLAN_FREE,
  USER_PLAN_PRO,
  buildForcedFreeSignupBilling,
  omitClientBillingFields,
} from "@/lib/billing/user-defaults";

describe("signup billing defaults", () => {
  it("never stores plan pro on registration", () => {
    const billing = buildForcedFreeSignupBilling({
      subscriptionType: "trial_signup",
    });

    expect(DEFAULT_SIGNUP_PLAN).toBe(USER_PLAN_FREE);
    expect(billing.plan).toBe(USER_PLAN_FREE);
    expect(billing.plan).not.toBe(USER_PLAN_PRO);
    expect(billing.isPaid).toBe(false);
  });

  it("ignores client-injected plan and payment fields", () => {
    const sanitized = omitClientBillingFields({
      email: "attacker@example.com",
      name: "Attacker",
      password: "Secret123",
      plan: "pro",
      isPaid: true,
      trialStart: "2099-01-01",
      trialEnd: "2099-12-31",
      subscriptionType: "lemon_squeezy",
      lemonSqueezyCustomerId: "cus_injected",
      lemonSqueezySubscriptionId: "sub_injected",
    });

    expect(sanitized).toEqual({
      email: "attacker@example.com",
      name: "Attacker",
      password: "Secret123",
    });

    for (const field of CLIENT_INJECTABLE_BILLING_FIELDS) {
      expect(sanitized).not.toHaveProperty(field);
    }

    const created = {
      ...sanitized,
      ...buildForcedFreeSignupBilling({
        subscriptionType: "mobile_signup",
      }),
    };

    expect(created.plan).toBe("free");
    expect(created.isPaid).toBe(false);
    expect(created.subscriptionType).toBe("mobile_signup");
  });

  it("keeps trial dates so effective access can still be trial-based", () => {
    const now = new Date("2026-01-15T00:00:00.000Z");
    const billing = buildForcedFreeSignupBilling({
      subscriptionType: "trial_signup",
      now,
    });

    expect(billing.trialStart).toEqual(now);
    expect(billing.trialEnd?.getTime()).toBe(now.getTime() + SIGNUP_TRIAL_MS);
    expect(
      getEffectiveUserTier({
        ...billing,
        trialEnd: billing.trialEnd,
      } as any)
    ).toBe("pro");
  });

  it("omits trial fields when includeTrial is false", () => {
    const billing = buildForcedFreeSignupBilling({ includeTrial: false });

    expect(billing).toEqual({
      plan: "free",
      isPaid: false,
    });
    expect(getEffectiveUserTier(billing as any)).toBe("free");
  });
});
