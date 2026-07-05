import {
  buildGracePeriodUpdate,
  hasPermanentProGrant,
  shouldReceiveBillingGracePeriod,
} from "@/lib/billing/grace-period";

describe("billing grace period", () => {
  it("grants permanent pro only for explicit manual types", () => {
    expect(
      hasPermanentProGrant({ isPaid: false, subscriptionType: "manual_paid" })
    ).toBe(true);
    expect(
      hasPermanentProGrant({ isPaid: false, subscriptionType: "trial_signup" })
    ).toBe(false);
    expect(hasPermanentProGrant({ isPaid: true, subscriptionType: undefined })).toBe(
      true
    );
  });

  it("offers grace to legacy unpaid users without active trial", () => {
    expect(
      shouldReceiveBillingGracePeriod({
        isPaid: false,
        plan: "pro",
        trialEnd: undefined,
        subscriptionType: undefined,
      } as any)
    ).toBe(true);

    expect(
      shouldReceiveBillingGracePeriod({
        isPaid: false,
        plan: "pro",
        trialEnd: new Date("2020-01-01"),
        subscriptionType: "trial_signup",
      } as any)
    ).toBe(true);
  });

  it("skips users who already received billing grace", () => {
    expect(
      shouldReceiveBillingGracePeriod({
        isPaid: false,
        plan: "pro",
        trialEnd: new Date("2020-01-01"),
        subscriptionType: "billing_grace_period",
      } as any)
    ).toBe(false);
  });

  it("skips active trial and paid users", () => {
    expect(
      shouldReceiveBillingGracePeriod({
        isPaid: false,
        plan: "pro",
        trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        subscriptionType: "trial_signup",
      } as any)
    ).toBe(false);

    expect(
      shouldReceiveBillingGracePeriod({
        isPaid: true,
        plan: "pro",
        trialEnd: undefined,
        subscriptionType: "lemon_squeezy",
      } as any)
    ).toBe(false);
  });

  it("buildGracePeriodUpdate sets pro plan and billing_grace_period type", () => {
    const now = new Date("2026-07-05T12:00:00.000Z");
    const update = buildGracePeriodUpdate(now);

    expect(update.plan).toBe("pro");
    expect(update.isPaid).toBe(false);
    expect(update.subscriptionType).toBe("billing_grace_period");
    expect(update.trialStart).toEqual(now);
    expect(update.trialEnd.getTime()).toBeGreaterThan(now.getTime());
  });
});
