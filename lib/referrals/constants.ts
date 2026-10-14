export const REFERRAL_QUERY_PARAM = "ref";

export const REFERRAL_COOKIE_NAME = "presusimple_ref";

/** Matches codes from crypto.randomBytes(4).toString("hex").toUpperCase(). */
export const REFERRAL_CODE_PATTERN = /^[A-F0-9]{8}$/;

export const REFERRAL_BONUS_DAYS = 30;

export const REFERRAL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ReferralCookie {
  name: string;
  value: string;
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
}

export function normalizeReferralCode(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  if (!REFERRAL_CODE_PATTERN.test(code)) return null;
  return code;
}

/**
 * Add the referral bonus on top of an active trial.
 * Expired or missing trials start from `now`.
 */
export function nextTrialEnd(
  current: Date | string | null | undefined,
  now: Date,
  bonusDays: number = REFERRAL_BONUS_DAYS
): Date {
  const currentMs = current ? new Date(current).getTime() : Number.NaN;
  const baseline =
    Number.isFinite(currentMs) && currentMs > now.getTime()
      ? currentMs
      : now.getTime();
  return new Date(baseline + bonusDays * DAY_MS);
}

export function buildReferralCookie(
  value: string | null | undefined
): ReferralCookie | null {
  const code = normalizeReferralCode(value);
  if (!code) return null;

  return {
    name: REFERRAL_COOKIE_NAME,
    value: code,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: REFERRAL_COOKIE_MAX_AGE_SECONDS,
  };
}
