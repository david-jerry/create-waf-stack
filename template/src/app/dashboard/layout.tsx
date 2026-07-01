import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { ThemeProvider } from "@/components/providers/theme-provider"
import { auth } from "@/lib/auth"

import "@/app/globals.css"

/**
 * Dashboard root layout. proxy.ts already redirects unauthenticated users, but
 * we re-check server-side here (defense in depth — never trust the middleware
 * alone for data access).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) redirect("/auth/login")

	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-dvh bg-background text-foreground antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
				</ThemeProvider>
			</body>
		</html>
	)
}
