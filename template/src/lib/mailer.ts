import { Resend } from "resend"

import { config } from "@/config"
import { CLogger } from "@/lib/logger"

const resend = new Resend(config.RESEND_API_KEY)

export interface SendMailProps {
	to: string | string[]
	subject: string
	html: string
	from?: string
}

/** Send a single transactional email via Resend. */
export async function sendMail(props: SendMailProps): Promise<void> {
	const from = props.from ?? config.FROM_EMAIL
	CLogger.info(`[RESEND] Sending to ${props.to} from "${from}"`)
	try {
		const { data, error } = await resend.emails.send({
			from,
			to: props.to,
			subject: props.subject,
			html: props.html,
		})
		if (error) throw error
		CLogger.info(`[RESEND] Email dispatched: ${data?.id}`)
	} catch (error) {
		const reason = error instanceof Error ? error.message : JSON.stringify(error)
		CLogger.error(`[MAIL_ERROR] Delivery failed to ${props.to}: ${reason}`)
		throw error // rethrow so background jobs (Inngest) can retry
	}
}

/** Bulk send via Resend's Batch API. */
export async function sendBulkEmail(
	recipients: { email: string }[],
	subject: string,
	html: string,
	from: string = config.FROM_EMAIL,
): Promise<void> {
	if (recipients.length === 0) return
	const CHUNK = 100
	for (let i = 0; i < recipients.length; i += CHUNK) {
		const batch = recipients.slice(i, i + CHUNK).map((r) => ({ from, to: r.email, subject, html }))
		const { error } = await resend.batch.send(batch)
		if (error) throw error
	}
}

export default sendMail
