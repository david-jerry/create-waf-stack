# create-waf-stack

A `create-next-app`-style generator for a **Well-Architected Next.js 16 full-stack app**. It always installs the **latest** versions (framework via `create-next-app@latest`, every library via `@latest`), lays down the folder structure, and overlays the architecture skeleton — so you start from a wired-up stack instead of empty folders.

**What you get:** Next.js 16 (App Router, RSC-first) · React 19 · Tailwind 4 + shadcn/ui · Drizzle ORM + Postgres (Neon in prod) · Upstash Redis (tag-based cache) · better-auth (RBAC, minimal tables) · Inngest (background jobs) · Cloudinary (signed uploads) · Resend (email) · Winston · centralized env with fail-fast secrets · server-action guards · response envelope · route-group layouts with error/loading states · a portable `CLAUDE.md` architecture contract.

## Usage

### Option A — one-line bootstrap (no auth, recommended)
```bash
curl -fsSL https://raw.githubusercontent.com/david-jerry/create-waf-stack/main/create.sh | bash -s my-app
```

### Option B — from GitHub Packages via npx
GitHub Packages requires auth even for public reads. Once, add to `~/.npmrc`:
```
@david-jerry:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT   # PAT with read:packages
```
Then:
```bash
npx @david-jerry/create-waf-stack my-app
```

### Option C — clone and run
```bash
git clone https://github.com/david-jerry/create-waf-stack && node create-waf-stack/bin/index.mjs my-app
```

## Flags
| Flag | Effect |
|---|---|
| `--pm=pnpm\|npm\|yarn\|bun` | Package manager (default `pnpm`) |
| `--no-install` | Scaffold only; skip dependency install |
| `--no-shadcn` | Skip shadcn/ui init |
| `--no-next` | Overlay onto an existing project (skip `create-next-app`) |

## After scaffolding
```bash
cd my-app
cp .env.example .env.local     # fill DATABASE_URL, UPSTASH_*, CLOUDINARY_*, RESEND_API_KEY, ENC_KEY_*
pnpm db:generate && pnpm db:migrate
pnpm dev
```

## Publishing (maintainer)
Push a tag to publish to GitHub Packages:
```bash
npm version patch && git push --follow-tags
```
The `.github/workflows/publish.yml` workflow publishes on any `v*` tag using the built-in `GITHUB_TOKEN`.

## How it works
Mirrors how shadcn overlays onto a Next app:
1. `create-next-app@latest` → latest Next/React/Tailwind/TS baseline
2. overlay `./template` (this repo) with `{{APP_NAME}}`/`{{APP_SLUG}}` substitution
3. `pnpm add <libs>@latest` → the architecture libraries
4. `shadcn@latest init` + a base component set
5. patch `package.json` with `db:*` / `inngest` scripts

Nothing is version-pinned — every run tracks upstream latest.
