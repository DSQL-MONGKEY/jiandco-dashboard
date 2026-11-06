# Auth

## Overview

Authentication is self-managed by the Jiandco Go API. The dashboard uses a Next.js BFF (Backend for Frontend) so tokens never reach the browser.

## Cookies

| Cookie | Purpose | Lifetime |
|---|---|---|
| `jiandco_access` | JWT access token | 1 hour |
| `jiandco_refresh` | Refresh token | 7 days |

Cookies are `httpOnly`, `sameSite=lax`, `path=/`, and `Secure` in production.

## Flow

1. `POST /api/auth/login` forwards username/password to the backend.
2. On success, the BFF stores both tokens as cookies and calls `/auth/me` to return `{ user, permissions }`.
3. Client data requests go through `/api/[...path]`.
4. If the backend returns `401`, the BFF calls `/auth/refresh` with the refresh cookie, updates both cookies, and retries once.
5. `POST /api/auth/logout` revokes the backend session and clears cookies.
6. `GET /api/auth/me` returns the current user and effective permissions.

## BFF files

- `src/app/api/auth/*` — login, refresh, logout, me, profile, password, avatar.
- `src/app/api/[...path]/route.ts` — authenticated proxy for dashboard resources.
- `src/lib/backend.ts` — backend fetch, refresh, and response forwarding.
- `src/lib/auth-cookies.ts` — cookie names and options.
- `src/lib/api-client.ts` — browser client; unwraps the backend envelope.
- `src/lib/server-api.ts` — optional server prefetch; returns `null` on failure.

## Security

- Never expose raw access/refresh tokens to client components.
- Never store tokens in localStorage.
- Do not log tokens or cookie values.
- `src/proxy.ts` only checks cookie presence for redirects; backend authorization remains the source of truth.
- Mutating BFF routes should be treated as same-origin only; use `sameSite=lax` cookies and validate origin in production if a stricter CSRF policy is needed.

## Endpoints

```text
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/password
POST /api/auth/avatar
```
