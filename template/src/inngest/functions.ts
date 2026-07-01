import { config } from "@/config"
import sendMail, { sendBulkEmail } from "@/lib/mailer"

import { inngest } from "./client"

/**
 * Background email — enqueue with:
 *   await inngest.send({ name: "app/email", data: { to, subject, html } })
 * Slow/external work belongs here (durable retries), never inline in a request.
 */
export const sendEmailInngest = inngest.createFunction(
	{ id: "send-email", retries: 3, triggers: [{ event: "app/email" }] },
	async ({ event, step }) => {
		await step.sleep("throttle", "1s")
		const { to, subject, html } = event.data as { to: string; subject: string; html: string }
		try {
			await sendMail({ to, subject, html })
			return { message: `Email sent to ${to}` }
		} catch (error) {
			const reason = error instanceof Error ? error.message : JSON.stringify(error)
			throw new Error(`Email failed for ${to}: ${reason}`)
		}
	},
)

/**
 * Bulk email fan-out via Resend's Batch API. Enqueue with:
 *   await inngest.send({ name: "app/bulk-email", data: { subject, html, recipients: [{ email }] } })
 */
export const sendBulkEmailInngest = inngest.createFunction(
	{ id: "send-bulk-email", retries: 3, triggers: [{ event: "app/bulk-email" }] },
	async ({ event }) => {
		const { subject, html, recipients } = event.data as {
			subject: string
			html: string
			recipients: { email: string }[]
		}
		await sendBulkEmail(recipients, subject, html, config.FROM_EMAIL)
		return { message: `Bulk email queued for ${recipients.length} recipient(s)` }
	},
)
