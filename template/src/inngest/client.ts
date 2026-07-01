import { Inngest } from "inngest"

import { config } from "@/config"

/**
 * Inngest client. `isDev` is forced on outside production so local requests to
 * the serve endpoint aren't rejected with "No x-inngest-signature provided".
 * In production set INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY.
 */
export const inngest = new Inngest({
	id: "{{APP_SLUG}}",
	isDev: config.NODE_ENV !== "production",
})
