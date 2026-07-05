# Lemon Squeezy Billing Runbook

This document describes how Presusimple billing is wired and how to verify production configuration.

## Architecture

- **Tier model:** Free vs Pro (single paid variant)
- **Trial:** 30-day app-managed trial on sign-up (`lib/auth.ts`), not Lemon Squeezy trial
- **Checkout:** `POST /api/lemonsqueezy/checkout` (session-authenticated)
- **Webhooks:** `POST /api/lemonsqueezy/webhook` (HMAC-signed)
- **Portal:** `POST /api/lemonsqueezy/portal` (session-authenticated)
- **Access control:** `getEffectiveUserTier()` in `lib/userAccess.ts` combines `isPaid`, trial dates, and plan

## Required environment variables

Set these in `.env.local` (dev) and production:

| Variable | Purpose |
|----------|---------|
| `LEMONSQUEEZY_API_KEY` | Lemon Squeezy API key |
| `LEMONSQUEEZY_STORE_ID` | Store ID for checkout |
| `LEMONSQUEEZY_VARIANT_ID` | Pro subscription variant ID |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | Public app URL for post-checkout redirect |

See [`env.example`](../env.example) for the template.

### Automated setup (CLI)

If you have a Lemon Squeezy API key, run:

```bash
LEMONSQUEEZY_API_KEY=your_key npm run setup:lemonsqueezy
```

For production webhook URL:

```bash
LEMONSQUEEZY_API_KEY=your_key npm run setup:lemonsqueezy -- --webhook-url https://www.presusimple.com/api/lemonsqueezy/webhook
```

This uses [`lsq-mini-cli`](https://github.com/MertMURAT/lsq-mini-cli) to list stores/products, creates a webhook via the Lemon Squeezy API (with a generated signing secret), and writes `LEMONSQUEEZY_*` values into `.env.local`.

**Note:** API keys and subscription products must still be created in the Lemon Squeezy dashboard first. The CLI cannot create those.

## Lemon Squeezy dashboard checklist

### Product / variant

1. Create (or confirm) one **Pro subscription** product in your Lemon Squeezy store.
2. Copy the **Variant ID** into `LEMONSQUEEZY_VARIANT_ID`.
3. Copy the **Store ID** into `LEMONSQUEEZY_STORE_ID`.
4. Set pricing on the variant in the Lemon Squeezy dashboard (prices are not stored in this repo).

### Webhook

1. In Lemon Squeezy → Settings → Webhooks, add:
   - **URL:** `https://www.presusimple.com/api/lemonsqueezy/webhook`
   - **Signing secret:** same value as `LEMONSQUEEZY_WEBHOOK_SECRET`
2. Enable at minimum:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
   - `subscription_resumed`
   - `subscription_paused`
   - `subscription_unpaused`
   - `subscription_payment_success`
   - `subscription_payment_failed`
   - `subscription_payment_recovered`
   - `order_refunded` (recommended)
   - `subscription_payment_refunded` (recommended)

### Checkout redirect

Checkout uses:

```
{NEXT_PUBLIC_APP_URL}/budget?checkout=success
```

Spanish locale uses `/es/budget?checkout=success`.

Ensure `NEXT_PUBLIC_APP_URL` matches your deployed domain (no trailing slash issues; code normalizes to full URL).

### Legal pages (store approval)

Public legal pages required for Lemon Squeezy review:

| Page | URL |
|------|-----|
| Privacy Policy | `https://www.presusimple.com/privacy` |
| Terms of Service | `https://www.presusimple.com/terms` |

Spanish: `/es/privacy` and `/es/terms`. Enter these URLs in Lemon Squeezy → Settings → General if prompted.

## Verification steps

### 1. Local / staging smoke test

1. Set all `LEMONSQUEEZY_*` vars and restart the app.
2. Sign in with a test user.
3. Click **Upgrade to Pro** → should redirect to Lemon Squeezy checkout (not 503/401).
4. Complete test-mode checkout.
5. Confirm webhook updates the user in MongoDB:
   - `isPaid: true`
   - `plan: "pro"`
   - `subscriptionType: "lemon_squeezy"`
   - `lemonSqueezyCustomerId` / `lemonSqueezySubscriptionId` populated
6. Return URL should show checkout success toast and refresh subscription data.
7. Open **Settings → Manage Subscription** → should open Lemon customer portal.

### 2. Automated tests

```bash
npm test -- lemonsqueezy
npm test -- userAccess
npm test -- ai-create-access
npm run type-check
npm run lint
```

### 3. Security checks

- Checkout and portal routes require an authenticated NextAuth session (email from session, not request body).
- Webhook rejects requests without valid `X-Signature` HMAC.
- Duplicate webhook events are ignored via `WebhookEvent` idempotency records.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Checkout returns 503 | Missing `LEMONSQUEEZY_*` env vars | Set API key, store ID, variant ID |
| Checkout returns 401 | User not signed in | Sign in before upgrading |
| User not upgraded after payment | Webhook misconfigured or email mismatch | Verify webhook URL/secret; ensure checkout uses same email as Presusimple account |
| Portal returns 400 | No `lemonSqueezySubscriptionId` on user | Complete checkout first; check webhook logs |
| Pro features blocked after payment | Cache stale | Refresh; webhook should update MongoDB |
| Expired trial still shows Pro in DB | Expected until webhook/manual update | App gates access via `getEffectiveUserTier()` |

## Manual overrides (admin)

For support cases, admins can use `/admin/manual-subscription` to activate paid/trial or set plan without Lemon Squeezy. These coexist with `subscriptionType: "lemon_squeezy"` records.

## Related code

- [`lib/lemonsqueezy.ts`](../lib/lemonsqueezy.ts) — SDK setup, webhook helpers, subscription mapping
- [`lib/userAccess.ts`](../lib/userAccess.ts) — effective tier / feature access
- [`app/api/lemonsqueezy/`](../app/api/lemonsqueezy/) — checkout, webhook, portal routes
- [`hooks/useCheckout.ts`](../hooks/useCheckout.ts) — client checkout trigger
