import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { SignOutButton } from "./sign-out-button"

export default async function DashboardPage() {
	const session = await auth.api.getSession({ headers: await headers() })
	const user = session?.user

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Dashboard</h1>
				<SignOutButton />
			</div>
			<div className="rounded-lg border p-6">
				<p className="text-sm text-muted-foreground">Signed in as</p>
				<p className="text-lg font-medium">{user?.name}</p>
				<p className="text-sm text-muted-foreground">{user?.email}</p>
				<p className="mt-2 text-xs">
					Role: <span className="font-mono">{(user as { role?: string })?.role ?? "user"}</span>
				</p>
			</div>
			<p className="text-sm text-muted-foreground">
				Build your admin here. Mutations go in <code>src/actions/*</code> (guarded via{" "}
				<code>lib/guard.ts</code>), reads cache through <code>lib/cache.ts</code>.
			</p>
		</div>
	)
}
