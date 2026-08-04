# AGENTS.md

Guidance for AI coding assistants working on the Presusimple codebase.

---

## Quick Reference

| Task | Location / Command |
|------|-------------------|
| Add API route | `app/api/[resource]/route.ts` → `lib/api.ts` → `lib/hooks/use*Queries.ts` |
| Add page | `app/[route]/page.tsx` |
| Add translation | `lib/i18n.ts` (add key to `translations.en` and `translations.es`) |
| Add feature flag | `lib/features.ts` + `lib/userAccess.ts` (hasAccess) |
| Add blog post | `content/blog/en/*.mdx` + `content/blog/es/*.mdx` (same slug per locale) |
| Grant legacy Pro grace | `scripts/migrate-billing-grace-period.js` (see Billing section) |
| Platform admin | `/admin` — requires `ADMIN_EMAILS` + `session.user.isAdmin` |
| Run tests | `npm test` |
| Type check | `npm run type-check` |
| Path alias | Use `@/` for imports from project root |

## ⚠️ Regla Obligatoria para Agentes IA (Mandatory Pre-Commit Rule)

**ANTES DE REALIZAR CUALQUIER COMMIT O DESPLIEGUE**:
Los agentes IA **DEBEN OBLIGATORIAMENTE** ejecutar la verificación completa de tests y el build del proyecto antes de confirmar cambios.

- **Comandos de Verificación en presusimple**:
  - `npm test && npm run type-check && npm run build` (o `pnpm check && pnpm build`).
- **Instrucciones Estrictas**:
  1. **NUNCA** realizar `git commit` ni `git push` si existen errores de linter, tipos (TypeScript), tests fallidos o errores en la compilación del paquete de producción.
  2. Si la verificación detecta fallos, el agente debe corregir la causa raíz del error y **volver a ejecutar la verificación** hasta obtener un resultado 100% limpio antes de proceder con el commit o despliegue.

---

## Project Overview

**Presusimple** is a personal finance management web application built with:
- **Framework**: Next.js 15, React 18 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Auth**: NextAuth.js (Google OAuth, credentials)
- **Styling**: Tailwind CSS, Radix UI (shadcn/ui)
- **State/Data**: TanStack React Query
- **Payments**: Lemon Squeezy
- **i18n**: `lib/i18n.ts` (en/es, `useTranslation()`, `useLocale()`)
- **PWA**: next-pwa, `lib/pwa-utils.ts`, `worker/`
- **Feature flags**: `lib/features.ts`, `lib/userAccess.ts`

---

## Directory Structure

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router: pages, layouts, API routes |
| `app/api/` | API route handlers (REST-like) |
| `components/` | Reusable React components |
| `components/ui/` | shadcn/ui components (button, dialog, etc.) |
| `lib/` | Shared utilities, hooks, auth, DB, API clients |
| `lib/hooks/` | React Query hooks for data fetching |
| `lib/billing/` | Billing grace period helpers (`grace-period.ts`) |
| `lib/auth/` | Admin config (`admin-config.ts`, server `admin.ts`) |
| `lib/blog.ts` | MDX blog post loading (en/es) |
| `lib/seo.ts` | SEO metadata helpers |
| `content/blog/` | MDX blog content (`en/`, `es/`) |
| `components/blog/` | Blog index and post UI |
| `components/admin/` | Admin nav link and admin UI pieces |
| `scripts/` | One-off migrations and setup scripts |
| `models/` | Mongoose schemas (User, Budget, Expense, Category, etc.) |
| `hooks/` | Feature-specific hooks (PWA, notifications, etc.) |
| `types/` | TypeScript declarations |
| `__tests__/` | Jest tests (unit, API) |
| `docs/` | Feature docs (auth, PWA, notifications, etc.) |

---

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run lint:fix     # Auto-fix ESLint issues
npm test             # Run Jest tests
npm run test:watch   # Jest watch mode
npm run test:coverage # Jest with coverage
```

---

## Code Quality Rules (Strict Mode)

The project enforces strict code quality. See `.cursor/rules/rule.mdc` for full details.

### Core Principles

1. **DRY** – Extract repeated logic into helpers or components.
2. **SOLID** – Single responsibility; avoid tight coupling.
3. **No breaking changes** – Do not modify shared utilities/models without checking impact.

### Before Editing Shared Files

- **Shared utilities**: `lib/utils.ts`, `lib/utils/`, `lib/errorHandler.ts`
- **Hooks**: `lib/hooks/*`, `hooks/*`
- **Models**: `models/*.ts`
- **Auth**: `lib/auth.ts`, `lib/auth-middleware.ts`, `lib/jwt.ts`
- **i18n**: `lib/i18n.ts` (add keys to both `en` and `es`)

**Required steps**: Identify dependencies, explain impact, get confirmation before proceeding.

### Patterns to Follow

- Use modular, testable components.
- Keep files focused on a single purpose.
- Extract constants; avoid magic strings.
- Add tests for new features.
- Run tests after changes.

---

## Auth Patterns

Two auth mechanisms exist:

| Context | Method | Usage |
|---------|--------|-------|
| **Web (cookie)** | `getServerSession(authOptions)` | Most routes: notifications, monthly-budgets, admin, users/currency |
| **Mobile/API (JWT)** | `requireAuth(request)` from `lib/auth-middleware.ts` | Bearer token in `Authorization` header |

**Note**: Core CRUD routes (`/api/budgets`, `/api/expenses`, `/api/categories`) accept `userId` as a query/body param. Auth is enforced at the page/layout level; the client supplies the session-derived userId.

### Platform admin

Admin access is email-allowlist based, not a DB role.

| Module | Purpose |
|--------|---------|
| `lib/auth/admin-config.ts` | **Client-safe.** Parses `ADMIN_EMAILS` / `NEXT_PUBLIC_ADMIN_EMAILS`, exports `isAdminEmail()` |
| `lib/auth/admin.ts` | **Server-only.** `requireAdmin()`, `requireAdminApi()`, `getAdminSession()` |
| `lib/hooks/useIsAdmin.ts` | Client hook — returns `session.user.isAdmin === true` only (no email fallback) |
| `app/admin/layout.tsx` | Calls `requireAdmin()` — redirects non-admins to `/admin-access-denied` |
| `components/admin/AdminNavLink.tsx` | Renders admin link only when `useIsAdmin()` is true |

Session flag: `lib/auth.ts` JWT/session callbacks set `user.isAdmin` from `isAdminEmail(email)`.

**Do not** import `lib/auth/admin.ts` or `lib/auth.ts` from client components (pulls Mongoose). Use `admin-config.ts` or `useIsAdmin()` instead.

Admin routes: `/admin`, `/admin/users`, `/admin/features`, `/admin/notifications`, `/admin/feature-flags`, `/admin/manual-subscription`.

Admin APIs: `/api/admin/users`, `/api/admin/features`, `/api/admin/notifications`. User list/PATCH/DELETE on `/api/users` also require admin.

---

## Data Flow & React Query

1. **API client**: `lib/api.ts` – fetch wrappers for each resource.
2. **React Query hooks**: `lib/hooks/use*Queries.ts` – use `useQuery`/`useMutation` with typed query keys.
3. **Components**: Import hooks; never call `lib/api.ts` directly from components.

### Query Key Pattern

```ts
export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (userId: string) => [...expenseKeys.lists(), userId] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};
```

### Mutation Invalidation

Expense mutations invalidate: `expenseKeys.lists()`, `["categories"]`, `["budgets"]`. Follow this pattern for related data.

---

## Key Shared Modules

| Module | Purpose | Dependencies |
|--------|---------|--------------|
| `lib/mongoose.ts` | MongoDB connection | Used by all API routes |
| `lib/auth.ts` | NextAuth config | Sessions, providers |
| `lib/auth-middleware.ts` | JWT auth for mobile/API | Bearer tokens |
| `lib/features.ts` | Feature flag definitions | FEATURES, FeatureKey |
| `lib/userAccess.ts` | Plan/feature access (`getEffectiveUserTier`, `hasAccess`) | IUser, FEATURES, grace-period |
| `lib/billing/grace-period.ts` | Legacy billing grace, permanent Pro grants | userAccess, auth sign-in, migration script |
| `lib/hooks/useAccessControl.ts` | Paid/trial/expired gating for budget UI | `getSubscriptionStatus` from `lib/utils` |
| `hooks/useCheckout.ts` | Lemon Squeezy checkout redirect | `/api/lemonsqueezy/checkout` |
| `lib/lemonsqueezy.ts` | Checkout + webhook mapping | Lemon Squeezy env vars |
| `lib/hooks/useUserId.ts` | Current user ID | Many components |
| `lib/hooks/useExpenseQueries.ts` | Expense CRUD | ExpenseList, forms |
| `lib/hooks/useBudgetQueries.ts` | Budget CRUD | Budget pages |
| `lib/utils/formatMoney.ts` | Money formatting | Summary, lists |
| `lib/i18n.ts` | Translations (en/es) | useTranslation, useLocale |

---

## API Structure

- **Base**: `/api/*`
- **Auth**: `/api/auth/[...nextauth]`
- **Resources**: `/api/budgets`, `/api/expenses`, `/api/categories`, `/api/monthly-budgets`
- **Admin**: `/api/admin/features`, `/api/admin/notifications`, `/api/admin/users`
- **Billing**: `/api/lemonsqueezy/checkout`, `/api/lemonsqueezy/webhook`
- **Users**: `/api/users` (admin-only list/PATCH/DELETE), `/api/users/manual-subscription`
- **Docs**: Swagger at `/api-docs`, spec at `/api/swagger`

**Swagger**: Add JSDoc `@swagger` comments to route handlers for API documentation.

---

## How to Add...

### New API endpoint

1. Create `app/api/[resource]/route.ts` (or add to existing).
2. Call `dbConnect()` at route start.
3. For protected routes: use `getServerSession(authOptions)` from `lib/auth` (web) or `requireAuth(request)` (JWT).
4. Add `@swagger` JSDoc for docs.
5. Add fetch function in `lib/api.ts`.
6. Add React Query hook in `lib/hooks/use*Queries.ts` with proper query keys and invalidation.

### New page

1. Create `app/[route]/page.tsx`.
2. Use `useUserId()` and existing hooks for data.
3. Add translations in `lib/i18n.ts` if needed.

### New translation key

1. Add key to `translations.en` and `translations.es` in `lib/i18n.ts`.
2. Use `useTranslation().t("key")` in components.

---

## Billing & subscription access

Payments use **Lemon Squeezy**. See `docs/billing-lemon-squeezy.md` for dashboard setup.

### Effective tier (`lib/userAccess.ts`)

`getEffectiveUserTier()` is the single source of truth for Pro vs free:

1. **`isPaid === true`** → Pro (Lemon Squeezy or manual paid)
2. **Active trial** (`isInTrial(trialEnd)`) → Pro
3. **`plan === "pro"` + no `trialEnd` + `hasPermanentProGrant()`** → Pro (admin grants only: `manual_paid`, `manual_pro_only`)
4. **Otherwise** → free (even if `plan` is still `"pro"` in MongoDB)

**Do not** add a blanket `plan === "pro"` bypass without payment or trial — legacy users used to get free Pro forever that way.

### User `subscriptionType` values

| Value | Meaning |
|-------|---------|
| `trial_signup` | New Google signup 30-day trial |
| `mobile_signup` | Mobile registration trial |
| `billing_grace_period` | One-time legacy grace before paywall (see below) |
| `lemon_squeezy` | Paid via Lemon Squeezy webhook |
| `manual_paid` | Admin grant — permanent Pro |
| `manual_pro_only` | Admin grant — permanent Pro without trial dates |

### Billing grace period (legacy users)

When payments launched, existing unpaid Pro/trial users get a **one-time grace window** (default 30 days, `BILLING_GRACE_PERIOD_DAYS`).

| Module | Purpose |
|--------|---------|
| `lib/billing/grace-period.ts` | `shouldReceiveBillingGracePeriod()`, `buildGracePeriodUpdate()`, `hasPermanentProGrant()` |
| `scripts/migrate-billing-grace-period.js` | Bulk DB migration (run once per environment) |
| `lib/auth.ts` signIn callback | Grants grace on Google login if eligible and not yet migrated |

Migration commands:

```bash
node scripts/migrate-billing-grace-period.js --dry-run   # preview eligible users
node scripts/migrate-billing-grace-period.js             # apply
```

After grace expires: user gets **free tier** + paywall (`components/AccessRestricted.tsx` on `app/budget/page.tsx`). Checkout via `hooks/useCheckout.ts`.

Paywall rule in `app/budget/page.tsx`: block when `!hasProAccess && onboardingComplete` where `hasProAccess = isPaid || isInTrial`. Do not skip paywall for users missing `trialEnd`.

### Lemon Squeezy webhook

`lib/lemonsqueezy.ts` → `mapSubscriptionToUserUpdate()` sets `isPaid`, `plan`, `subscriptionType: "lemon_squeezy"`. Pro statuses: `active`, `on_trial`, `cancelled`, `past_due`.

---

## SEO, marketing & blog

Public landing and content marketing routes (no auth):

| Route | Purpose |
|-------|---------|
| `/`, `/es` | Landing pages with JSON-LD, OG/Twitter metadata |
| `/blog`, `/blog/[slug]` | English MDX blog |
| `/es/blog`, `/es/blog/[slug]` | Spanish MDX blog |
| `/sitemap.xml` | `app/sitemap.ts` |
| `/robots.txt` | `app/robots.ts` |
| `/opengraph-image` | Dynamic OG image (`app/opengraph-image.tsx`) |
| `/llms.txt` | AI discoverability (`public/llms.txt`) |

### Adding a blog post

1. Create matching slugs in `content/blog/en/{slug}.mdx` and `content/blog/es/{slug}.mdx`.
2. Frontmatter: `title`, `description`, `date`, `author`, `tags`.
3. Posts are loaded by `lib/blog.ts`; rendered via `components/blog/BlogPostView.tsx` and `mdxComponents.tsx`.
4. Sitemap picks up slugs automatically via `app/sitemap.ts`.

SEO helpers live in `lib/seo.ts`. Root defaults in `app/layout.tsx` (`metadataBase`, robots, OG).

---

## Validation & data integrity

- **Duplicate names**: Server + client validation prevents duplicate budget and category names (see budget/category API routes and forms).
- Before changing shared validation, grep for existing checks in API routes and form components.

---

## Common Pitfalls

- **Forgetting `dbConnect()`** – All API routes that touch MongoDB must call `await dbConnect()`.
- **Wrong auth** – Use `getServerSession` for web; `requireAuth` for JWT. Don’t mix them.
- **Missing invalidation** – Mutations that affect related data (e.g. expenses → categories) must invalidate those query keys.
- **Hardcoded strings** – Use `lib/i18n.ts` for user-facing text.
- **Editing shared modules** – Check usages first; avoid breaking callers.
- **Admin client imports** – Never import `lib/auth/admin.ts` or Mongoose-backed modules in `"use client"` components.
- **Legacy Pro bypass** – Never grant Pro from `plan === "pro"` alone; use `getEffectiveUserTier()` and grace-period helpers.
- **Billing migration** – Run `migrate-billing-grace-period.js` once per MongoDB environment when rolling out billing changes.

## UI Theme and Styling

The app uses Tailwind CSS with CSS variables defined in `app/globals.css`.

- **Colors**: Always use CSS variables for colors (e.g., `bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `text-muted-foreground`).
- **Accent Color**: `bg-accent` uses a bright yellow-green (`#d3ff3d`). Text on top of `bg-accent` must be `text-accent-foreground` (which is very dark/black) to ensure readability in both light and dark modes. Do not use `text-accent-foreground` on transparent or non-accent backgrounds in dark mode, as it will be black on black.
- **Dark Mode**: Avoid hardcoded colors like `text-black`, `bg-white`, `text-gray-900`, etc. Rely exclusively on the semantic CSS variables (`bg-primary`, `text-primary-foreground`, etc.) to support both light and dark themes.

---

## Don’t

- Don’t call `lib/api.ts` directly from components; use `lib/hooks/*` React Query hooks.
- Don’t add inline magic strings; extract to constants or i18n.
- Don’t modify `lib/userAccess.ts` or `lib/features.ts` without understanding feature flag usage.
- Don’t skip `getServerSession`/`requireAuth` on routes that should be protected.
- Don’t forget to add `@swagger` docs for new API endpoints.

---

## Testing

- **Framework**: Jest with `@testing-library/react`
- **Location**: `__tests__/` (unit, API)
- **Run**: `npm test` or `npm run test:watch`
- **Coverage**: `npm run test:coverage`

Add tests for new features and changes to shared logic.

---

## Environment

Copy `env.example` to `.env.local`. Never commit `.env.local`.

### Required (core app)

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | NextAuth |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |

### Billing (production)

| Variable | Purpose |
|----------|---------|
| `LEMONSQUEEZY_API_KEY` | Lemon Squeezy API |
| `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_VARIANT_ID` | Checkout |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook signature verification |
| `NEXT_PUBLIC_APP_URL` | Checkout redirect base URL |
| `BILLING_GRACE_PERIOD_DAYS` | Legacy grace window (default `30`) |

### Admin

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAILS` | Comma-separated admin emails (server) |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Optional client mirror; prefer `session.user.isAdmin` after sign-in |
| `JWT_SECRET` | Mobile/API JWT signing |

Set admin and JWT vars on **Production** and **Development** in Vercel. Preview may require branch-specific env in the Vercel dashboard.

See `README.md` and `docs/billing-lemon-squeezy.md` for full setup.

---

## Documentation

- `README.md` – Setup and overview
- `docs/billing-lemon-squeezy.md` – Lemon Squeezy setup and webhooks
- `docs/` – Feature docs (auth, PWA, notifications, feature flags)
- `API_DOCUMENTATION_UPDATE.md` – API/Swagger notes

---

## Deployment checklist (for agents)

When shipping billing, admin, or SEO changes:

1. **Push** commits to `origin/main` and deploy on Vercel.
2. **Env vars** — confirm Lemon Squeezy, `ADMIN_EMAILS`, `JWT_SECRET`, `BILLING_GRACE_PERIOD_DAYS` on target environment.
3. **Billing migration** — if MongoDB was not migrated locally, run `node scripts/migrate-billing-grace-period.js --dry-run` then apply against that environment's DB.
4. **Lemon Squeezy webhook** — point production webhook to `/api/lemonsqueezy/webhook`; verify with a test event.
5. **Admin** — sign out/in after changing `ADMIN_EMAILS` so JWT/session picks up `isAdmin`.
6. **Tests** — `npm test` and `npm run type-check` before merge.

---

## Workflow for AI Agents

1. **Read and understand** – Use this file and README before changes.
2. **Check impact** – Use grep/search to find usages of shared code.
3. **Incremental changes** – Prefer small, focused edits.
4. **Test** – Run `npm test` and `npm run type-check` after changes.
5. **Lint** – Run `npm run lint` before committing.
