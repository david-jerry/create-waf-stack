import "server-only"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"

/**
 * Server-action auth guards. Route middleware (`proxy.ts`) only gates page
 * navigation — server actions are independently callable, so every mutation
 * must check the caller here. Each helper returns the session when permitted, or
 * `null` when not, so callers fail with their own standard envelope:
 *
 *   const session = await requireAdmin()
 *   if (!session) return { status: false, data: null, error: "Unauthorized" }
 */

export type AppRole = "user" | "admin" | "superadmin"

export async function getSession() {
	return auth.api.getSession({ headers: await headers() })
}

/** Any authenticated user. */
export async function requireUser() {
	const session = await getSession()
	return session?.user ? session : null
}

/** Caller must hold one of `roles`. */
export async function requireRole(...roles: AppRole[]) {
	const session = await getSession()
	const role = session?.user?.role as AppRole | undefined
	return session?.user && role && roles.includes(role) ? session : null
}

export const requireAdmin = () => requireRole("admin", "superadmin")
export const requireSuperAdmin = () => requireRole("superadmin")
