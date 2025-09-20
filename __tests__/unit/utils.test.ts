import {
  calculateTrialDaysLeft,
  isTrialExpired,
  isInTrial,
  getSubscriptionStatus,
} from "@/lib/utils";

describe("utils - subscription/trial helpers", () => {
  describe("calculateTrialDaysLeft", () => {
    it("returns remaining whole days (>= 0)", () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      expect(calculateTrialDaysLeft(future)).toBeGreaterThanOrEqual(5);
    });

    it("returns 0 for past dates or null", () => {
      const past = new Date();
      past.setDate(past.getDate() - 3);
      expect(calculateTrialDaysLeft(past)).toBe(0);
      expect(calculateTrialDaysLeft(null)).toBe(0);
    });
  });

  describe("isTrialExpired", () => {
    it("is true when trial ended and user is not paid", () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(isTrialExpired(past, false)).toBe(true);
    });

    it("is false when user is paid or no trial", () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(isTrialExpired(past, true)).toBe(false);
      expect(isTrialExpired(null, false)).toBe(false);
    });
  });

  describe("isInTrial", () => {
    it("is true when trial end is in the future and user not paid", () => {
      const future = new Date();
      future.setDate(future.getDate() + 2);
      expect(isInTrial(future, false)).toBe(true);
    });

    it("is false when paid or without trial", () => {
      const future = new Date();
      future.setDate(future.getDate() + 2);
      expect(isInTrial(future, true)).toBe(false);
      expect(isInTrial(null as any, false)).toBe(false);
    });
  });

  describe("getSubscriptionStatus", () => {
    it("returns paid when isPaid is true", () => {
      expect(getSubscriptionStatus({ isPaid: true })).toBe("paid");
    });

    it("returns trial when trial end is in the future", () => {
      const future = new Date();
      future.setDate(future.getDate() + 1);
      expect(getSubscriptionStatus({ isPaid: false, trialEnd: future })).toBe(
        "trial"
      );
    });

    it("returns expired when trial ended and not paid", () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(getSubscriptionStatus({ isPaid: false, trialEnd: past })).toBe(
        "expired"
      );
    });

    it("returns none when not paid and no trial", () => {
      expect(getSubscriptionStatus({ isPaid: false })).toBe("none");
    });
  });
});

