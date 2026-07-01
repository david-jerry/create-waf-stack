import { getCookieCache, getSessionCookie } from "better-auth/cookies"
import { NextResponse, type NextRequest } from "next/server"

/** Roles permitted into /admin (mirrors auth.ts adminRoles). */
const ADMIN_ROLES = ["admin", "superadmin"]

/**
 * Route gating (Next.js middleware). Gates NAVIGATION only — server actions
 * re-check via lib/guard.ts. Admin role is read from the signed session-cookie
 * cache (edge-safe); on a cache miss we fall through to the page-level guard so
 * a stale cache never locks a legitimate admin out.
 */
export async function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl
	const isAuthenticated = !!getSessionCookie(req)

	const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/")
	const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/")
	const isProtected = isAdminRoute || isDashboardRoute
	const isAuthRoute = pathname.startsWith("/auth/")

	if (isAuthenticated && isAuthRoute) {
		return NextResponse.redirect(new URL("/dashboard", req.url))
	}

	if (!isAuthenticated && isProtected) {
		const loginUrl = new URL("/auth/login", req.url)
		loginUrl.searchParams.set("redirect", pathname)
		return NextResponse.redirect(loginUrl)
	}

	if (isAuthenticated && isAdminRoute) {
		const cached = await getCookieCache(req)
		const role = (cached?.user as { role?: string } | undefined)?.role
		if (role) {
			const roles = role.split(",").map((r) => r.trim())
			if (!roles.some((r) => ADMIN_ROLES.includes(r))) {
				return NextResponse.redirect(new URL("/", req.url))
			}
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
}
