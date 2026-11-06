# Deployment

## VPS rjm

Dashboard production berjalan di `https://dash.jiandco.id` sebagai bagian dari stack
`/opt/jiandco` di VPS rjm. Stack ini memakai network Docker, PostgreSQL, dan Cloudflare
Tunnel milik stack rjm. Runbook lengkap ada di `jiandco-api/docs/deployment-vps-rjm.md`.

Environment production:

```env
BACKEND_URL=http://jiandco-api:8080/api/v1
NEXT_PUBLIC_APP_URL=https://dash.jiandco.id
BUILD_STANDALONE=true
```

Image: `ghcr.io/dsql-mongkey/jiandco-dashboard:<sha>`.

Dashboard diproteksi Cloudflare Access sebelum login aplikasi. `BACKEND_URL` memakai nama
service internal (`jiandco-api`), bukan domain publik, karena request BFF berjalan
server-side di network yang sama.

## Prerequisites

- Jiandco Go API deployed and reachable from the Next.js server.
- PostgreSQL and migrations applied on the API side.
- Node.js 22+ or Bun for build.

## Environment

```env
BACKEND_URL=http://jiandco-api:8080/api/v1
NEXT_PUBLIC_APP_URL=https://dash.jiandco.id
BUILD_STANDALONE=true
```

- `BACKEND_URL` is server-only. It must include `/api/v1`.
- `NEXT_PUBLIC_APP_URL` is used for metadata and can be used for origin checks.
- Cookies are automatically `Secure` when `NODE_ENV=production`.
- Do not expose backend tokens or `BACKEND_URL` to the client bundle.

## Build

```bash
bun install --frozen-lockfile
bun run build
```

For standalone output set `BUILD_STANDALONE=true`.

## Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_APP_URL=https://dash.jiandco.id \
  -t jiandco-dashboard .
docker run -d \
  --name jiandco-dashboard \
  --restart unless-stopped \
  -p 3000:3000 \
  -e BACKEND_URL=https://api.jiandco.id/api/v1 \
  -e NEXT_PUBLIC_APP_URL=https://dash.jiandco.id \
  jiandco-dashboard
```

The frontend container needs network access to the API. Do not point `BACKEND_URL` at a browser-only URL.

## Reverse Proxy

Place the dashboard behind TLS (Nginx, Caddy, Traefik, or a load balancer).

Ensure:

- `/api/*` is forwarded to the Next.js server.
- Request body limit is at least 64 MB for image/receipt uploads.
- Timeouts allow uploads to complete.
- `X-Forwarded-Proto` is set so secure cookies work correctly.

## API Requirements

Before serving the dashboard:

1. Apply API migrations: `atlas migrate apply --env local` (or production equivalent).
2. Seed roles/permissions/developer: `go run ./cmd/seed`.
3. Verify API health: `GET /healthz` and `GET /readyz`.

## CI/CD

Workflow `.github/workflows/ci.yml` menjalankan typecheck, lint, build, lalu push image
ke GHCR dan deploy lewat SSH saat push ke `main`/`master`.

Secrets yang dibutuhkan:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`

Variable:

- `VPS_APP_DIR=/opt/jiandco`
- `IMAGE_PREFIX=ghcr.io/dsql-mongkey` (opsional)

Rollback dashboard:

```bash
cd /opt/jiandco
sed -i 's/^DASHBOARD_TAG=.*/DASHBOARD_TAG=<sha-lama>/' .env
docker compose pull jiandco-dashboard
docker compose up -d --wait jiandco-dashboard
```

## Verification

1. Open `/auth/sign-in`.
2. Sign in with a seeded account.
3. Confirm navigation reflects the user's permissions.
4. Create a product and verify images/stock.
5. Create an order and test status/payment/shipping transitions.
6. Open `/dashboard/overview` and verify the monthly revenue chart.
7. Sign out and confirm cookies are cleared.
