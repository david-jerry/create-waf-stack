import Link from "next/link"

export default function NotFound() {
	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
			<h1 className="text-6xl font-bold">404</h1>
			<p className="text-muted-foreground">This page could not be found.</p>
			<Link href="/" className="rounded-md border px-4 py-2 text-sm">Go home</Link>
		</main>
	)
}
