import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { signUploadParams } from "@/lib/cloudinary"

/**
 * Signing endpoint for direct browser → Cloudinary uploads.
 *  - Auth-gated: only signed-in users can obtain a signature.
 *  - Folder + key allowlists: a signature can't target assets outside our
 *    namespace or sign dangerous params (resource_type raw, access_mode, etc.).
 *  - The API secret stays server-side; only the signature is returned.
 */
const ALLOWED_FOLDER_PREFIX = "{{APP_SLUG}}/"
const SIGNABLE_KEYS = new Set([
	"timestamp", "folder", "public_id", "source", "tags", "context", "eager", "upload_preset",
])

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

	let body: { paramsToSign?: Record<string, unknown> }
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
	}

	const paramsToSign = body.paramsToSign
	if (!paramsToSign || typeof paramsToSign !== "object") {
		return NextResponse.json({ error: "Missing paramsToSign" }, { status: 400 })
	}

	const disallowed = Object.keys(paramsToSign).filter((k) => !SIGNABLE_KEYS.has(k))
	if (disallowed.length) {
		return NextResponse.json({ error: `Parameters not permitted: ${disallowed.join(", ")}` }, { status: 403 })
	}

	const folder = paramsToSign.folder
	if (folder !== undefined && (typeof folder !== "string" || !folder.startsWith(ALLOWED_FOLDER_PREFIX))) {
		return NextResponse.json({ error: "Folder not permitted" }, { status: 403 })
	}

	try {
		const signature = signUploadParams(paramsToSign)
		return NextResponse.json({ signature })
	} catch {
		return NextResponse.json({ error: "Could not sign upload" }, { status: 500 })
	}
}
