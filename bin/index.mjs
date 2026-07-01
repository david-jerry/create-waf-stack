#!/usr/bin/env node
// @david-jerry/create-waf-stack — scaffold a Well-Architected Next.js 16 full-stack app.
//
// Flow (mirrors how shadcn overlays onto a Next app):
//   1. create-next-app@latest  → latest Next / React / Tailwind / TS baseline
//   2. overlay the architecture skeleton (this package's ./template)
//   3. pnpm add <libs>@latest   → Drizzle, Redis, Cloudinary, better-auth, Inngest, Resend...
//   4. shadcn@latest init + a base component set
//
// Nothing is version-pinned to the origin project: the framework comes from
// create-next-app@latest and every extra library is installed with @latest.

import { spawnSync } from "node:child_process"
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { createInterface } from "node:readline/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = resolve(__dirname, "..", "template")

const c = {
	reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
	green: "\x1b[32m", cyan: "\x1b[36m", yellow: "\x1b[33m", red: "\x1b[31m", magenta: "\x1b[35m",
}
const log = (m) => console.log(m)
const step = (m) => log(`\n${c.cyan}${c.bold}▸ ${m}${c.reset}`)
const ok = (m) => log(`${c.green}✔${c.reset} ${m}`)
const warn = (m) => log(`${c.yellow}⚠${c.reset} ${m}`)
const die = (m) => { console.error(`${c.red}✖ ${m}${c.reset}`); process.exit(1) }

// ── args ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const flags = new Set(argv.filter((a) => a.startsWith("--")))
const positional = argv.filter((a) => !a.startsWith("--"))
const getFlagValue = (name) => {
	const hit = argv.find((a) => a.startsWith(`${name}=`))
	return hit ? hit.split("=")[1] : undefined
}
const NO_INSTALL = flags.has("--no-install")
const NO_SHADCN = flags.has("--no-shadcn")
const SKIP_BASELINE = flags.has("--no-next") // overlay-only mode (project already exists)
const PM = getFlagValue("--pm") || "pnpm"

function toSlug(s) {
	return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}
function toTitle(slug) {
	return slug.split("-").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
}

function run(cmd, args, cwd) {
	log(`${c.dim}$ ${cmd} ${args.join(" ")}${c.reset}`)
	const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" })
	return r.status === 0
}

// Copy ./template into the project, substituting {{APP_*}} tokens in text files.
function overlay(targetDir, tokens) {
	const walk = (src, dest) => {
		for (const entry of readdirSync(src)) {
			const s = join(src, entry)
			// npm strips a leading "." dir sometimes; template stores dotfiles as "_dot_"
			const outName = entry.replace(/^_dot_/, ".").replace(/\.tmpl$/, "")
			const d = join(dest, outName)
			if (statSync(s).isDirectory()) {
				mkdirSync(d, { recursive: true })
				walk(s, d)
			} else {
				let content = readFileSync(s)
				const isText = /\.(ts|tsx|js|mjs|json|md|css|txt|yml|yaml|example|gitignore|npmrc|env)$/i.test(outName) || outName.startsWith(".")
				if (isText) {
					let t = content.toString("utf8")
					for (const [k, v] of Object.entries(tokens)) t = t.replaceAll(k, v)
					content = Buffer.from(t, "utf8")
				}
				mkdirSync(dirname(d), { recursive: true })
				writeFileSync(d, content)
			}
		}
	}
	walk(TEMPLATE_DIR, targetDir)
}

// Merge our db/inngest scripts into create-next-app's package.json.
function patchPackageJson(targetDir) {
	const pkgPath = join(targetDir, "package.json")
	if (!existsSync(pkgPath)) return
	const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
	pkg.scripts = {
		...pkg.scripts,
		"db:generate": "drizzle-kit generate",
		"db:migrate": "drizzle-kit migrate",
		"db:push": "drizzle-kit push",
		"db:studio": "drizzle-kit studio",
		"auth:generate": "better-auth generate",
		inngest: "pnpm dlx inngest-cli@latest dev",
	}
	writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
}

async function main() {
	log(`${c.magenta}${c.bold}\n  create-waf-stack${c.reset} ${c.dim}— Well-Architected Next.js full-stack scaffold${c.reset}`)

	let name = positional[0]
	if (!name) {
		const rl = createInterface({ input: process.stdin, output: process.stdout })
		name = await rl.question(`${c.cyan}?${c.reset} Project name: `)
		rl.close()
	}
	const slug = toSlug(name || "")
	if (!slug) die("A project name is required.")
	const title = toTitle(slug)
	const targetDir = resolve(process.cwd(), slug)

	if (existsSync(targetDir) && readdirSync(targetDir).length && !SKIP_BASELINE) {
		die(`Directory "${slug}" already exists and is not empty.`)
	}

	if (!existsSync(TEMPLATE_DIR)) die(`Template directory missing at ${TEMPLATE_DIR}`)

	// 1. Framework baseline (latest) ------------------------------------------
	if (!SKIP_BASELINE) {
		step("Scaffolding Next.js baseline (create-next-app@latest)")
		const cnaArgs = [
			"create-next-app@latest", slug,
			"--ts", "--tailwind", "--eslint", "--app", "--src-dir",
			"--import-alias", "@/*", "--turbopack", "--no-git", "--yes",
		]
		cnaArgs.push(PM === "pnpm" ? "--use-pnpm" : PM === "yarn" ? "--use-yarn" : PM === "bun" ? "--use-bun" : "--use-npm")
		if (NO_INSTALL) cnaArgs.push("--skip-install")
		const runner = process.platform === "win32" ? "npx.cmd" : "npx"
		if (!run(runner, ["-y", ...cnaArgs], process.cwd())) {
			die("create-next-app failed. Re-run, or pass --no-next to overlay onto an existing project.")
		}
		ok("Next.js baseline created")
	}

	// 2. Overlay the architecture ---------------------------------------------
	step("Overlaying Well-Architected structure")
	// The route groups own <html>; remove create-next-app's single root layout/page.
	for (const f of ["src/app/layout.tsx", "src/app/page.tsx"]) {
		const p = join(targetDir, f)
		if (existsSync(p)) rmSync(p)
	}
	overlay(targetDir, {
		"{{APP_NAME}}": title,
		"{{APP_SLUG}}": slug,
	})
	patchPackageJson(targetDir)
	ok("Structure, lib/, db/, inngest/, auth, docs written")

	// 3. Libraries (latest) ----------------------------------------------------
	if (!NO_INSTALL) {
		step("Installing architecture libraries (@latest)")
		const deps = [
			"drizzle-orm", "drizzle-zod", "@neondatabase/serverless", "pg",
			"@upstash/redis", "better-auth", "inngest", "cloudinary", "next-cloudinary",
			"resend", "@react-email/components", "winston", "winston-daily-rotate-file",
			"sanitize-html", "zod", "react-hook-form", "@hookform/resolvers", "dotenv",
			"nanoid", "uuid", "next-themes", "class-variance-authority", "clsx", "tailwind-merge", "lucide-react",
		].map((d) => `${d}@latest`)
		const devDeps = [
			"drizzle-kit", "@types/pg", "@types/sanitize-html", "@types/uuid",
		].map((d) => `${d}@latest`)

		const add = (list, dev) => {
			if (PM === "pnpm") return run("pnpm", ["add", ...(dev ? ["-D"] : []), ...list], targetDir)
			if (PM === "yarn") return run("yarn", ["add", ...(dev ? ["-D"] : []), ...list], targetDir)
			if (PM === "bun") return run("bun", ["add", ...(dev ? ["-d"] : []), ...list], targetDir)
			return run("npm", ["install", ...(dev ? ["-D"] : []), ...list], targetDir)
		}
		if (!add(deps, false)) warn("Some dependencies failed to install — run the add command manually.")
		if (!add(devDeps, true)) warn("Some devDependencies failed to install.")
		ok("Libraries installed at latest versions")

		// 4. shadcn/ui -----------------------------------------------------------
		if (!NO_SHADCN) {
			step("Initializing shadcn/ui + base components")
			const dlx = PM === "pnpm" ? ["pnpm", ["dlx"]] : PM === "bun" ? ["bunx", []] : ["npx", ["-y"]]
			run(dlx[0], [...dlx[1], "shadcn@latest", "init", "-b", "neutral", "--yes"], targetDir)
			run(dlx[0], [...dlx[1], "shadcn@latest", "add", "--yes",
				"button", "input", "label", "card", "sonner", "dialog", "dropdown-menu", "skeleton", "separator", "badge"], targetDir)
			ok("shadcn/ui ready")
		}
	} else {
		warn("Skipped install (--no-install). See README for the manual add command.")
	}

	// Done --------------------------------------------------------------------
	log(`\n${c.green}${c.bold}✔ ${title} is ready.${c.reset}`)
	log(`\n${c.bold}Next steps${c.reset}`)
	log(`  ${c.cyan}cd ${slug}${c.reset}`)
	log(`  cp .env.example .env.local   ${c.dim}# then fill DATABASE_URL, UPSTASH_*, CLOUDINARY_*, RESEND_API_KEY, ENC_KEY_*${c.reset}`)
	log(`  ${PM} run db:generate && ${PM} run db:migrate   ${c.dim}# create + apply the initial migration${c.reset}`)
	log(`  ${PM === "npm" ? "npm run dev" : `${PM} dev`}`)
	log(`\n${c.dim}Architecture is documented in CLAUDE.md. Example domain: src/{db/models/item.ts, db/schemas/item.ts, actions/items.ts}.${c.reset}\n`)
}

main().catch((e) => die(e?.message || String(e)))
