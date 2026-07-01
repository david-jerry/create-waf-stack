/**
 * Centralized environment access — the ONLY place `process.env` is read.
 * Every other module imports from here. Add new env vars with a safe dev
 * default and document them in `.env.example`.
 */

const isProd = process.env.NODE_ENV === "production"
// Next evaluates this module during `next build` too; don't fail the build for a
// secret that's only injected at runtime — only fail fast in a running prod server.
const isBuild = process.env.NEXT_PHASE === "phase-production-build"
// `config` is imported by client components for public fields. Server secrets are
// NOT in the browser bundle (process.env only exposes NEXT_PUBLIC_*), so never
// fail-fast on the client — the value is unused there.
const isServer = typeof window === "undefined"

/**
 * Read a security-critical secret. On the server in production it MUST come from
 * the environment — a missing value is fatal (fail fast rather than silently
 * running on a known default). In dev / during build / on the client, a
 * clearly-fake fallback keeps things frictionless.
 */
function requireSecret(name: string, value: string | undefined, devFallback: string): string {
	if (value && value.length > 0) return value
	if (isServer && isProd && !isBuild) {
		throw new Error(`[config] Missing required secret "${name}" — set it in the production environment.`)
	}
	return devFallback
}

export const config = {
	TITLE: "{{APP_NAME}}",
	NODE_ENV: process.env.NODE_ENV ?? "development",

	BASE_URL: process.env.NODE_ENV === "development"
		? "http://localhost:3000"
		: (process.env.BASE_URL ?? "https://example.com"),

	// Origins better-auth accepts. Override with TRUSTED_ORIGINS (comma-separated).
	TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS
		? process.env.TRUSTED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
		: ["http://localhost:3000", "http://127.0.0.1:3000"],

	DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/{{APP_SLUG}}?schema=public",

	// Upstash Redis (HTTP/REST) — serverless cache client. Optional: the
	// CacheManager degrades to a no-op passthrough when these are unset.
	UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ?? "",
	UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",

	// Cloudinary
	CLOUDINARY_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_NAME,
	CLOUDINARY_API: process.env.NEXT_PUBLIC_CLOUDINARY_API,
	CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,

	// Email (Resend). FROM_EMAIL must be on a domain verified in Resend.
	RESEND_API_KEY: requireSecret("RESEND_API_KEY", process.env.RESEND_API_KEY, "re_dev_placeholder"),
	FROM_EMAIL: process.env.EMAIL_FROM ?? "{{APP_NAME}} <onboarding@resend.dev>",

	// OAuth (optional)
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SK: process.env.GOOGLE_CLIENT_SK,

	// Background jobs (Inngest) — required in production for signed requests.
	INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
	INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,

	// Encryption / signing secrets — required in production (no committed defaults).
	ENC_KEY_1: requireSecret("ENC_KEY_1", process.env.ENC_KEY_1, "dev-only-enc-key-one-do-not-use-in-prod"),
	ENC_KEY_2: requireSecret("ENC_KEY_2", process.env.ENC_KEY_2, "dev-only-enc-key-two-do-not-use-in-prod"),
}
