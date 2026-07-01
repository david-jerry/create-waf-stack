import { v2 as cloudinary } from "cloudinary"

import { config } from "@/config"

cloudinary.config({
	cloud_name: config.CLOUDINARY_NAME,
	api_key: config.CLOUDINARY_API,
	api_secret: config.CLOUDINARY_SECRET,
	secure: true,
})

/**
 * Sign params for a direct browser → Cloudinary upload. Only the computed
 * signature is returned; the API secret never leaves the server. Pair with the
 * auth-gated, allowlisted `/api/cloudinary/sign` route.
 */
export function signUploadParams(paramsToSign: Record<string, unknown>): string {
	return cloudinary.utils.api_sign_request(
		paramsToSign as Record<string, string | number>,
		config.CLOUDINARY_SECRET as string,
	)
}

/**
 * Server-side upload (for small/programmatic uploads). Forces secure options:
 * image only, no overwrite, unpredictable id, constrained folder.
 */
export async function uploadToCloudinaryDetailed(
	source: string,
	{ folder = "{{APP_SLUG}}/uploads" }: { folder?: string } = {},
): Promise<{ url: string; publicId: string }> {
	const res = await cloudinary.uploader.upload(source, {
		folder,
		resource_type: "image",
		allowed_formats: ["png", "jpg", "jpeg", "webp", "gif", "avif"],
		overwrite: false,
		unique_filename: true,
		use_filename: false,
	})
	return { url: res.secure_url, publicId: res.public_id }
}

export { cloudinary }
