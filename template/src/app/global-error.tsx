"use client"

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<html lang="en">
			<body style={{ display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "system-ui" }}>
				<h1>Application error</h1>
				<button onClick={reset}>Try again</button>
			</body>
		</html>
	)
}
