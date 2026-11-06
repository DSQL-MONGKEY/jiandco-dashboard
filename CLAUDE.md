# CLAUDE.md

See [AGENTS.md](./AGENTS.md) for the full project conventions.

Key points:

- Next.js 16 App Router, TypeScript, TanStack Query, shadcn/ui.
- Auth is a Next.js BFF with httpOnly cookies; there is no Clerk.
- Feature API layers follow `types.ts` → `service.ts` → `queries.ts`.
- Use `apiClient` on the client and `tryServerApi` for optional server prefetch.
- Use `useAuth` / `usePermission` / `RequirePermission` for RBAC UI.
- Never expose backend tokens to the browser.
