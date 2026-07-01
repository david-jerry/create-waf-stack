import Link from "next/link"

import { config } from "@/config"

export default function Home() {
	return (
		<main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
			<span className="text-xs uppercase tracking-widest text-muted-foreground">WAF Next.js Stack</span>
			<h1 className="text-4xl font-bold sm:text-5xl">{config.TITLE}</h1>
			<p className="max-w-xl text-muted-foreground">
				Next.js 16 · Drizzle/Postgres · Upstash Redis · Cloudinary · better-auth · Inngest · Resend.
				Server Components by default, server actions as the mutation layer, RBAC guards, tag-based caching.
			</p>
			<div className="flex gap-3">
				<Link href="/auth/login" className="rounded-md bg-foreground px-5 py-2 text-sm font-medium text-background">
					Sign in
				</Link>
				<Link href="/dashboard" className="rounded-md border px-5 py-2 text-sm font-medium">
					Dashboard
				</Link>
			</div>
		</main>
	)
}
