import { serve } from "inngest/next"

import { inngest } from "@/inngest/client"
import { sendBulkEmailInngest, sendEmailInngest } from "@/inngest/functions"

// Inngest re-invokes the handler per step; allow longer serverless execution.
export const maxDuration = 300

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [sendEmailInngest, sendBulkEmailInngest],
})
