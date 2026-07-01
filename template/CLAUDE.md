# CLAUDE.md — {{APP_NAME}}

Architecture contract for this project. These conventions override defaults; follow them.

## Stack
Next.js 16 (App Router, RSC-first) · React 19 · TypeScript strict (`@/*` → `src/*`) · Tailwind 4 + shadcn/ui · Drizzle ORM + Postgres (pg in dev, Neon serverless in prod) · Upstash Redis · better-auth (RBAC) · Inngest (background jobs) · Cloudinary (signed uploads) · Resend (email) · Winston (logging). Package manager: pnpm.

## Guiding principle — Well-Architected
Name the pillar a change serves: **Security** (guards, config secrets, sanitize), **Reliability** (Inngest retries, response envelope), **Performance** (RSC, Redis cache, cursor pagination), **Operational Excellence** (structured logs, migrations, conventional commits).

## The layering rule
```
UI (Server Component by default)
  → Server Action ("use server")   ← the ONLY mutation entry point
      → guard (authz) → Zod validate → Drizzle (DB) → cache.invalidateByTag
      → offload slow/external work to an Inngest event (never await inline)
  → returns ActionResult<T>  ({ status, data, error })
```
Components never touch the DB directly.

## Structure
```
src/
  app/
    (marketing)/  public site — owns <html>/<body>; has error/loading/not-found
    auth/         login/signup — owns <html>/<body>
    dashboard/    authenticated area — owns <html>/<body>, server-gated in layout
    api/          auth/[...all], inngest, cloudinary/sign
  actions/        "use server" mutations, one file per domain
  db/
    index.ts      drizzle instance (pg dev / neon prod)
    models/       Drizzle tables = source of truth (barrel in models/index.ts)
    schemas/      Zod DTOs (drizzle-zod)
    helpers/      id + timestamp helpers
  inngest/        client + functions (served at app/api/inngest)
  lib/            config, auth, authClient, permissions, guard, cache, redis,
                  mailer, cloudinary, sanitize, logger, utils
  types/          api.ts (ActionResult / APIResponse)
  config.ts       the ONLY place process.env is read
  proxy.ts        route gating (Next 16 middleware)
```
**No shared root layout** — each route group renders its own `<html>` (multiple root layouts). Every route gets a `loading.tsx`; each group gets `error.tsx`/`not-found.tsx`.

## Rules
- **Server Components by default.** `"use client"` only at interactive leaves.
- **Env through `config.ts` only** — never scatter `process.env`. Secrets fail fast in prod (server-side only).
- **Every mutation authorizes first** via `lib/guard.ts` (`requireUser`/`requireAdmin`/`requireSuperAdmin`) — `proxy.ts` gates navigation, not action calls.
- **Validate every action input** with a Zod schema from `db/schemas/` before touching the DB.
- **Cache reads** with `cache.wrap(key, loader, ttl, [tags])`; invalidate the tag in every mutation.
- **Sanitize rich text** on write with `lib/sanitize.ts` (server-safe, no jsdom). Never import `isomorphic-dompurify` server-side.
- **Background/slow work** → `inngest.send({ name, data })`, handled in `inngest/functions.ts`.
- **Schema changes**: edit `db/models/*` → `pnpm db:generate` → `pnpm db:migrate`. Regenerate better-auth tables with `pnpm dlx @better-auth/cli generate` when adding auth plugins.

## Adding a domain (the pattern)
1. `db/models/<name>.ts` — table + `$inferSelect/$inferInsert`, add to `models/index.ts`.
2. `db/schemas/<name>.ts` — Zod DTOs via `drizzle-zod`.
3. `actions/<name>.ts` — guard → validate → db → invalidate → return `ActionResult`.
4. `lib/cache.ts` — add a tag family + key group.
5. `pnpm db:generate && pnpm db:migrate`.
