export const USER_PLAN_FREE = "free" as const;
export const USER_PLAN_PRO = "pro" as const;

export type UserPlan = typeof USER_PLAN_FREE | typeof USER_PLAN_PRO;

/** Stored plan for every new registration. Never write "pro" at signup. */
export const DEFAULT_SIGNUP_PLAN = USER_PLAN_FREE;

export const SIGNUP_TRIAL_DAYS = 30;
export const SIGNUP_TRIAL_MS = SIGNUP_TRIAL_DAYS * 24 * 60 * 60 * 1000;

export const CLIENT_INJECTABLE_BILLING_FIELDS = [
  "plan",
  "isPaid",
  "trialStart",
  "trialEnd",
  "subscriptionType",
  "lemonSqueezyCustomerId",
  "lemonSqueezySubscriptionId",
] as const;

export type ClientInjectableBillingField =
  (typeof CLIENT_INJECTABLE_BILLING_FIELDS)[number];

export type SignupSubscriptionType = "trial_signup" | "mobile_signup";

/**
 * Drop billing/subscription fields a client may try to inject on register.
 * Call this before constructing a new user from request data.
 */
export function omitClientBillingFields<T extends Record<string, unknown>>(
  payload: T
): Omit<T, ClientInjectableBillingField> {
  const sanitized = { ...payload };
  for (const field of CLIENT_INJECTABLE_BILLING_FIELDS) {
    delete sanitized[field];
  }
  return sanitized;
}

export interface ForcedFreeSignupBilling {
  plan: typeof USER_PLAN_FREE;
  isPaid: false;
  trialStart?: Date;
  trialEnd?: Date;
  subscriptionType?: SignupSubscriptionType;
}

/**
 * Server-owned billing fields for new users.
 *
 * `plan` is always free. Temporary Pro *access* during the signup trial
 * comes from `trialEnd` + `getEffectiveUserTier()`, not from storing plan "pro".
 * Permanent plan "pro" is written only by the Lemon Squeezy webhook or
 * admin-protected subscription routes.
 */
export function buildForcedFreeSignupBilling(options?: {
  subscriptionType?: SignupSubscriptionType;
  now?: Date;
  includeTrial?: boolean;
}): ForcedFreeSignupBilling {
  const includeTrial = options?.includeTrial !== false;

  if (!includeTrial) {
    return {
      plan: DEFAULT_SIGNUP_PLAN,
      isPaid: false,
    };
  }

  const now = options?.now ?? new Date();
  const trialEnd = new Date(now.getTime() + SIGNUP_TRIAL_MS);

  return {
    plan: DEFAULT_SIGNUP_PLAN,
    isPaid: false,
    trialStart: now,
    trialEnd,
    subscriptionType: options?.subscriptionType,
  };
}
