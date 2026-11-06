# AGENTS.md

## Project

Jiandco internal dashboard for clothing operations. Frontend for the Jiandco Go API.

## Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- TanStack Query, TanStack Form, Zod, nuqs
- Recharts
- Bun

## Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/            # login, refresh, logout, me, profile, password, avatar
│   │   └── [...path]/       # generic authenticated BFF proxy
│   ├── auth/                # sign-in
│   ├── dashboard/           # overview, products, catalog, orders, customers,
│   │                        # accounting, users, roles, profile
│   └── print/               # invoice A4 and receipt 80mm
├── components/              # layout, UI, data table, forms, themes
├── config/nav-config.ts     # permission-aware navigation
├── features/
│   ├── auth/                # BFF client, auth context, permission guard
│   ├── products/            # products, variants, images, stock, catalog settings
│   ├── customers/
│   ├── orders/
│   ├── accounting/
│   ├── overview/
│   ├── users/
│   ├── roles/
│   └── profile/
├── lib/
│   ├── api-client.ts        # browser fetch to BFF, unwraps envelope
│   ├── backend.ts           # server-side backend fetch + refresh
│   ├── server-api.ts        # optional server prefetch (no refresh)
│   ├── auth-cookies.ts      # cookie names/options
│   ├── query-string.ts
│   └── format.ts            # IDR/date helpers
└── types/
    ├── api.ts               # shared backend response/entity types
    └── index.ts             # nav types
```

## Commands

```bash
bun install
bun run dev
bun run typecheck
bun run lint
bun run lint:strict
bun run format
bun run format:check
bun run build
bun run start
```

## Authentication

- Tokens are stored only in `httpOnly` cookies by Next.js route handlers.
- Never return access/refresh tokens to client components.
- `src/lib/backend.ts` handles backend calls and single-flight refresh on `401`.
- `src/lib/api-client.ts` is the browser client; it calls `/api/*`, unwraps `{success,data}`, and throws `ApiError`.
- `src/lib/server-api.ts` is only for optional server prefetch. It does not refresh tokens; return `null` on failure so the client can fetch through the BFF.
- `src/proxy.ts` is a lightweight cookie gate for `/dashboard` and `/auth`. It is not the security boundary.
- Do not add Clerk, Clerk middleware, or Clerk components.
- Backend URL comes from `BACKEND_URL` (server-only, must include `/api/v1`).

## RBAC

- Backend `/auth/me` returns `{ user, permissions }`.
- `AuthProvider` exposes `user`, `permissions`, `can(page, action)`, and `isSuperAdmin`.
- Level 0/1 bypass permission checks.
- Navigation items use `access: { permission: 'page.action' }`; `use-nav.ts` filters them.
- Protect pages with `RequirePermission page=... action=...`.
- Backend remains the source of truth; UI guards are defense in depth.

## API layer

Every feature follows:

```text
features/<name>/api/types.ts     # re-export shared types + filters/payloads
features/<name>/api/service.ts   # apiClient calls
features/<name>/api/queries.ts   # queryOptions + mutationOptions
features/<name>/components/**    # UI
```

Rules:

- Components import types from `api/types.ts` and queries/mutations from `api/queries.ts`.
- Mutations invalidate `<feature>Queries.all()` in `onSettled` or `onSuccess`.
- Use `toQueryString` for query params.
- Backend envelope: `{ success, data }` / `{ success, code, message }`.
- Backend list shape: `{ items, pagination }`.
- Backend uses UUID strings and integer IDR; never parse money as float.

## UI conventions

- Use `PageContainer` for page headers.
- Use `FieldHint` from `@/components/form-field-hint` under inputs to explain expected values.
- Use shadcn/ui components from `@/components/ui/*`.
- Use `formatIDR`, `formatDateTime`, `formatDateOnly`, `currentMonth` from `@/lib/format`.
- Use `<Money value={...} />` from `@/components/money` for all dashboard money displays. Hidden amounts render as blurred text, not dots. Print documents use `formatIDR` directly so invoices/receipts always show real amounts.
- Use `StatusBadge` for order/payment/shipping/product statuses.
- Use `sonner` toasts for mutation feedback.
- Prefer simple tables + `SimplePagination` for list pages; the existing DataTable remains available for complex tables.
- Use `BrandLogo` for the Ji&Co identity; do not reintroduce template logos.
- Catalog page settings are managed in the Catalog -> Settings tab via `/catalog/settings`.
- R2 image URLs may be object keys if the backend public base URL is empty; render a fallback when the URL is not absolute.

## Environment

```env
BACKEND_URL=http://localhost:2900/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
BUILD_STANDALONE=false
```

`BACKEND_URL` is server-only and must include `/api/v1`.

## Definition of done

- `bun run typecheck` passes.
- `bun run lint` passes (warnings allowed; `lint:strict` should be preferred).
- `bun run build` passes.
- Auth login/refresh/logout works through BFF cookies.
- RBAC nav and page guard match backend permissions.
- Relevant docs under `docs/` updated.
- No Clerk, Sentry, mock API, or demo-template code introduced.
