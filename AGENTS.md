# AGENTS.md

Guidance for AI coding assistants working on the Presusimple codebase.

---

## Project Overview

**Presusimple** is a personal finance management web application built with:
- **Framework**: Next.js 15, React 18
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Auth**: NextAuth.js (Google OAuth, credentials)
- **Styling**: Tailwind CSS, Radix UI (shadcn/ui)
- **State/Data**: TanStack React Query
- **Payments**: Stripe

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
| `docs/` | Feature documentation (auth, PWA, notifications, etc.) |

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

**Required steps**: Identify dependencies, explain impact, get confirmation before proceeding.

### Patterns to Follow

- Use modular, testable components.
- Keep files focused on a single purpose.
- Extract constants; avoid magic strings.
- Add tests for new features.
- Run tests after changes.

---

## Key Shared Modules

| Module | Purpose | Dependencies |
|--------|---------|--------------|
| `lib/mongoose.ts` | MongoDB connection | Used by all API routes |
| `lib/auth.ts` | NextAuth config | Sessions, providers |
| `lib/auth-middleware.ts` | Route protection | Auth state |
| `lib/userAccess.ts` | User/tenant access | Budgets, expenses |
| `lib/hooks/useUserId.ts` | Current user ID | Many components |
| `lib/hooks/useExpenseQueries.ts` | Expense CRUD | ExpenseList, forms |
| `lib/hooks/useBudgetQueries.ts` | Budget CRUD | Budget pages |
| `lib/utils/formatMoney.ts` | Money formatting | Summary, lists |

---

## API Structure

- **Base**: `/api/*`
- **Auth**: `/api/auth/[...nextauth]`
- **Resources**: `/api/budgets`, `/api/expenses`, `/api/categories`, `/api/monthly-budgets`
- **Admin**: `/api/admin/features`, `/api/admin/notifications`
- **Docs**: Swagger at `/api-docs`, spec at `/api/swagger`

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
