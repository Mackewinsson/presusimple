import User from "@/models/User";
import { attributeSignupReferral } from "@/lib/referrals/attribute";
import {
  REFERRAL_BONUS_DAYS,
  REFERRAL_COOKIE_NAME,
  buildReferralCookie,
  nextTrialEnd,
  normalizeReferralCode,
} from "@/lib/referrals/constants";

jest.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  },
}));

const findOne = User.findOne as jest.Mock;
const updateOne = User.updateOne as jest.Mock;

const NOW = new Date("2026-10-14T00:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

describe("referral codes", () => {
  it("accepts the shared link code and normalizes case", () => {
    expect(normalizeReferralCode("EA369D0B")).toBe("EA369D0B");
    expect(normalizeReferralCode(" ea369d0b ")).toBe("EA369D0B");
  });

  it("rejects missing and malformed codes", () => {
    expect(normalizeReferralCode(null)).toBeNull();
    expect(normalizeReferralCode("")).toBeNull();
    expect(normalizeReferralCode("EA369D0")).toBeNull();
    expect(normalizeReferralCode("EA369D0B1")).toBeNull();
    expect(normalizeReferralCode("TEST1234")).toBeNull();
    expect(normalizeReferralCode("not a code")).toBeNull();
  });

  it("builds an httpOnly cookie only for a valid code", () => {
    expect(buildReferralCookie("nope")).toBeNull();

    const cookie = buildReferralCookie("ea369d0b");
    expect(cookie).toMatchObject({
      name: REFERRAL_COOKIE_NAME,
      value: "EA369D0B",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  });
});

describe("referral trial extension", () => {
  it("starts a fresh 30 day window when the trial is missing or expired", () => {
    expect(nextTrialEnd(null, NOW).toISOString()).toBe(
      new Date(NOW.getTime() + REFERRAL_BONUS_DAYS * DAY_MS).toISOString()
    );
    expect(nextTrialEnd(new Date("2020-01-01T00:00:00.000Z"), NOW).toISOString()).toBe(
      new Date(NOW.getTime() + REFERRAL_BONUS_DAYS * DAY_MS).toISOString()
    );
  });

  it("stacks 30 days onto an active trial", () => {
    const activeEnd = new Date("2026-11-01T00:00:00.000Z");
    expect(nextTrialEnd(activeEnd, NOW).toISOString()).toBe(
      new Date(activeEnd.getTime() + REFERRAL_BONUS_DAYS * DAY_MS).toISOString()
    );
  });
});

describe("attributeSignupReferral", () => {
  beforeEach(() => {
    findOne.mockReset();
    updateOne.mockReset();
  });

  it("extends only the referrer trial and returns the code", async () => {
    findOne.mockResolvedValue({
      _id: "referrer-id",
      email: "owner@example.com",
      trialEnd: new Date("2026-11-01T00:00:00.000Z"),
    });
    updateOne.mockResolvedValue({ matchedCount: 1 });

    const code = await attributeSignupReferral({
      referralCode: "ea369d0b",
      newUserEmail: "Friend@Example.com",
      now: NOW,
    });

    expect(code).toBe("EA369D0B");
    expect(findOne).toHaveBeenCalledWith({ referralCode: "EA369D0B" });
    expect(updateOne).toHaveBeenCalledWith(
      { _id: "referrer-id" },
      {
        $set: {
          trialEnd: new Date("2026-12-01T00:00:00.000Z"),
        },
      }
    );
    const update = updateOne.mock.calls[0][1].$set;
    expect(update).not.toHaveProperty("plan");
    expect(update).not.toHaveProperty("isPaid");
    expect(update).not.toHaveProperty("subscriptionType");
  });

  it("ignores unknown codes and self-referrals", async () => {
    findOne.mockResolvedValue(null);
    await expect(
      attributeSignupReferral({
        referralCode: "EA369D0B",
        newUserEmail: "new@example.com",
        now: NOW,
      })
    ).resolves.toBeNull();

    findOne.mockResolvedValue({
      _id: "referrer-id",
      email: "same@example.com",
      trialEnd: null,
    });
    await expect(
      attributeSignupReferral({
        referralCode: "EA369D0B",
        newUserEmail: "same@example.com",
        now: NOW,
      })
    ).resolves.toBeNull();

    expect(updateOne).not.toHaveBeenCalled();
  });
});
