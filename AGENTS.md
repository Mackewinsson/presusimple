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
| Run tests | `npm test` |
| Type check | `npm run type-check` |
| Path alias | Use `@/` for imports from project root |

---

## Project Overview

**Presusimple** is a personal finance management web application built with:
- **Framework**: Next.js 15, React 18 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Auth**: NextAuth.js (Google OAuth, credentials)
- **Styling**: Tailwind CSS, Radix UI (shadcn/ui)
- **State/Data**: TanStack React Query
- **Payments**: Stripe
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
| `lib/userAccess.ts` | Plan/feature access (hasAccess, getUserPlan) | IUser, FEATURES |
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
- **Admin**: `/api/admin/features`, `/api/admin/notifications`
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

## Common Pitfalls

- **Forgetting `dbConnect()`** – All API routes that touch MongoDB must call `await dbConnect()`.
- **Wrong auth** – Use `getServerSession` for web; `requireAuth` for JWT. Don’t mix them.
- **Missing invalidation** – Mutations that affect related data (e.g. expenses → categories) must invalidate those query keys.
- **Hardcoded strings** – Use `lib/i18n.ts` for user-facing text.
- **Editing shared modules** – Check usages first; avoid breaking callers.

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

- Copy `env.example` to `.env.local`
- Required: `MONGODB_URI`, `NEXTAUTH_*`, `GOOGLE_*`, `STRIPE_*`
- See `README.md` for full list.

---

## Documentation

- `README.md` – Setup and overview
- `docs/` – Feature docs (auth, PWA, notifications, feature flags)
- `API_DOCUMENTATION_UPDATE.md` – API/Swagger notes

---

## Workflow for AI Agents

1. **Read and understand** – Use this file and README before changes.
2. **Check impact** – Use grep/search to find usages of shared code.
3. **Incremental changes** – Prefer small, focused edits.
4. **Test** – Run `npm test` and `npm run type-check` after changes.
5. **Lint** – Run `npm run lint` before committing.
