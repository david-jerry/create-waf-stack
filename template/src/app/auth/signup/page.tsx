"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { signUp } from "@/lib/authClient"

export default function SignupPage() {
	const router = useRouter()
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)
		setLoading(true)
		const form = new FormData(e.currentTarget)
		const { error } = await signUp.email({
			name: String(form.get("name")),
			email: String(form.get("email")),
			password: String(form.get("password")),
		})
		setLoading(false)
		if (error) return setError(error.message ?? "Sign up failed")
		router.push("/dashboard")
	}

	return (
		<form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
			<h1 className="text-2xl font-semibold">Create account</h1>
			<input name="name" placeholder="Name" required className="w-full rounded-md border bg-transparent px-3 py-2 text-sm" />
			<input name="email" type="email" placeholder="Email" required className="w-full rounded-md border bg-transparent px-3 py-2 text-sm" />
			<input name="password" type="password" placeholder="Password (min 8)" required minLength={8} className="w-full rounded-md border bg-transparent px-3 py-2 text-sm" />
			{error && <p className="text-sm text-red-500">{error}</p>}
			<button disabled={loading} className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-60">
				{loading ? "Creating…" : "Sign up"}
			</button>
			<p className="text-center text-sm text-muted-foreground">
				Have an account? <Link href="/auth/login" className="underline">Sign in</Link>
			</p>
		</form>
	)
}
