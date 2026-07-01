"use client"

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
			<h1 className="text-4xl font-bold">Something went wrong</h1>
			<p className="text-muted-foreground">An unexpected error occurred.</p>
			<button onClick={reset} className="rounded-md border px-4 py-2 text-sm">Try again</button>
		</main>
	)
}
