# {{APP_NAME}}

Full-stack Next.js 16 app scaffolded with [`create-waf-stack`](https://github.com/david-jerry/create-waf-stack).

**Stack:** Next.js 16 · React 19 · Tailwind 4 + shadcn/ui · Drizzle ORM + Postgres (Neon in prod) · Upstash Redis · better-auth (RBAC) · Inngest · Cloudinary · Resend · Winston.

## Getting started

```bash
cp .env.example .env.local     # fill in DATABASE_URL, secrets, service keys
pnpm db:generate               # generate the initial migration from db/models
pnpm db:migrate                # apply it
pnpm dlx @better-auth/cli generate   # (optional) regenerate auth tables when adding plugins
pnpm dev
```

Then open http://localhost:3000. Sign up at `/auth/signup`; the dashboard is at `/dashboard`.

For background jobs, run the Inngest dev server in another terminal:
```bash
pnpm inngest
```

## Scripts
| Script | What |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm db:generate` | Create a migration from `src/db/models` |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:push` | Push schema directly (prototyping) |
| `pnpm db:studio` | Browse the DB |
| `pnpm inngest` | Inngest dev server |

## Architecture
See **`CLAUDE.md`** for the full contract. In short: Server Components by default, server actions as the only mutation layer (guarded + Zod-validated), Redis tag-based caching, Inngest for slow work, and all env access centralized in `src/config.ts`.
