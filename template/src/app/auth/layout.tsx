import { ThemeProvider } from "@/components/providers/theme-provider"

import "@/app/globals.css"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-dvh bg-background text-foreground antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<div className="flex min-h-dvh items-center justify-center px-6">{children}</div>
				</ThemeProvider>
			</body>
		</html>
	)
}
