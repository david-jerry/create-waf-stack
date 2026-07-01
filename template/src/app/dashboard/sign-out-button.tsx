"use client"

import { useRouter } from "next/navigation"

import { signOut } from "@/lib/authClient"

export function SignOutButton() {
	const router = useRouter()
	return (
		<button
			onClick={async () => {
				await signOut()
				router.push("/auth/login")
			}}
			className="rounded-md border px-3 py-1.5 text-sm"
		>
			Sign out
		</button>
	)
}
