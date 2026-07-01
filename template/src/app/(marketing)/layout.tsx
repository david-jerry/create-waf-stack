import type { Metadata } from "next"

import { ThemeProvider } from "@/components/providers/theme-provider"
import { config } from "@/config"

import "@/app/globals.css"

export const metadata: Metadata = {
	metadataBase: new URL(config.BASE_URL),
	title: { default: config.TITLE, template: `%s · ${config.TITLE}` },
	description: `${config.TITLE} — built on the WAF Next.js stack.`,
}

/**
 * Root layout for the public site. Each route group ((marketing)/auth/dashboard)
 * has its OWN root layout that renders <html>/<body> — there is no shared
 * app/layout.tsx. Add a top-level route group the same way.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-dvh bg-background text-foreground antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{children}
				</ThemeProvider>
			</body>
		</html>
	)
}
