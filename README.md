# Ji&Co Dashboard

Internal operations dashboard for Ji&Co, a brand of PT. Sadhika Cipta Mandiri, built with Next.js 16 and the Jiandco Go API.

## Features

- Self-managed auth via the Jiandco API: username/password login, JWT access token, rotating refresh token.
- BFF auth: tokens live only in `httpOnly` cookies; the browser never sees raw tokens.
- RBAC-aware navigation and page guards using backend `page.action` permissions.
- Product catalog: products, variants, sizes, colors, categories, images, stock, and stock movement history. New products default to Active so they appear on the public catalog.
- Orders: create orders, edit pending items, status/payment/shipping transitions, tracking number.
- Customers: master data and shipping details.
- Accounting: expenses with line items, receipts, and monthly overview.
- Revenue overview with monthly filter and daily chart.
- User management and role permission matrix.
- Profile: profile update, avatar upload, password change.
- Global hide/show money toggle in the header: amounts are blurred, not replaced with dots.
- Revenue overview with vertical order bar chart and order-status pie chart.
- A4 invoice and 80mm thermal receipt printing from order detail.
- Ji&Co custom theme and brand logo.
- Catalog page settings (promo, intro, CTA) shared with the public `oinsh-page` catalog.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui (Base UI primitives)
- TanStack Query, TanStack Form, Zod, nuqs
- Recharts
- Bun

## Quick Start

1. Start the Jiandco API (default `http://localhost:2900/api/v1`).
2. Create `.env.local`:

```env
BACKEND_URL=http://localhost:2900/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
BUILD_STANDALONE=false
```

3. Install and run:

```bash
bun install
bun run dev
```

Open `http://localhost:3000`, then sign in with the developer account seeded by the backend.

## Authentication Flow

1. `POST /api/auth/login` calls the backend and stores `access` + `refresh` tokens as `httpOnly` cookies.
2. Protected requests go through `/api/[...path]` (BFF). On `401`, the BFF refreshes the token once and retries.
3. `GET /api/auth/me` returns the user plus effective permissions for navigation and page guards.
4. `POST /api/auth/logout` revokes the backend session and clears cookies.

## Commands

```bash
bun install
bun run dev
bun run typecheck
bun run lint
bun run format
bun run build
bun run start
```

## Structure

```text
src/
├── app/
│   ├── api/                 # Auth BFF + generic backend proxy
│   ├── auth/                # Sign-in page
│   └── dashboard/           # Overview, products, catalog, orders, customers,
│                            # accounting, users, roles, profile
├── components/              # UI, layout, data table, forms, themes
├── config/nav-config.ts     # Permission-aware navigation
├── features/                # Feature API layers + components
│   ├── auth/
│   ├── products/
│   ├── customers/
│   ├── orders/
│   ├── accounting/
│   ├── overview/
│   ├── users/
│   └── roles/
├── lib/                     # api-client, backend BFF, server prefetch, format
├── types/                   # Shared API types
└── docs/                    # Auth, API integration, deployment, forms, themes
```

## Documentation

- [Auth](docs/auth.md)
- [API Integration](docs/api-integration.md)
- [RBAC](docs/rbac.md)
- [Deployment](docs/deployment.md)
- [Forms](docs/forms.md)
- [Themes](docs/themes.md)

## SEO

This is an internal dashboard. It is intentionally `noindex` via metadata, `robots.txt`, and `X-Robots-Tag`; a PWA manifest and brand icons are provided for installation.

## Notes

- `BACKEND_URL` is server-only and must include `/api/v1`.
- R2 images are returned by the backend as URLs. If `R2_PUBLIC_BASE_URL` is empty, the API returns object keys instead of public URLs.
- The backend enforces authorization; the frontend guards are for UX and defense in depth.
