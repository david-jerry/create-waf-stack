import sanitizeHtmlLib from "sanitize-html"

/**
 * Server-safe HTML sanitizer for rich-text content.
 *
 * Uses `sanitize-html` (pure JS, htmlparser2) rather than DOMPurify so it runs
 * in the serverless runtime — `isomorphic-dompurify` pulls in `jsdom`, which
 * fails to load there (ERR_REQUIRE_ESM). Client-side rendering may still use
 * DOMPurify (the browser has a real DOM).
 */
export function sanitizeHtml(dirty: string): string {
	if (!dirty) return ""
	return sanitizeHtmlLib(dirty, {
		allowedTags: sanitizeHtmlLib.defaults.allowedTags.concat(["img", "h1", "h2", "u", "s", "span"]),
		allowedAttributes: {
			...sanitizeHtmlLib.defaults.allowedAttributes,
			a: ["href", "name", "target", "rel"],
			img: ["src", "alt", "width", "height"],
			"*": ["style", "class"],
		},
		allowedSchemes: ["http", "https", "mailto", "tel"],
		allowedSchemesByTag: { img: ["http", "https", "data"] },
	})
}
