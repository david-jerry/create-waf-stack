import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin as adminPlugin } from "better-auth/plugins"

import { config } from "@/config"
import db from "@/db"
import * as schema from "@/db/models"
import { ac, admin, superadmin, user } from "@/lib/permissions"
import { sendMail } from "@/lib/mailer"

/**
 * better-auth server config. Email/password + admin roles, sessions cached in a
 * signed cookie (edge-readable in proxy.ts). Regenerate/extend the Drizzle auth
 * tables with `pnpm dlx @better-auth/cli generate` when you add plugins.
 */
export const auth = betterAuth({
	appName: config.TITLE,
	baseURL: config.BASE_URL,
	trustedOrigins: config.TRUSTED_ORIGINS,
	database: drizzleAdapter(db, { provider: "pg", schema }),
	session: {
		cookieCache: { enabled: true, maxAge: 5 * 60 },
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		sendResetPassword: async ({ user, url }) => {
			await sendMail({
				to: user.email,
				subject: `Reset your ${config.TITLE} password`,
				html: `<p>Reset your password:</p><p><a href="${url}">${url}</a></p>`,
			})
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			await sendMail({
				to: user.email,
				subject: `Verify your ${config.TITLE} email`,
				html: `<p>Verify your email:</p><p><a href="${url}">${url}</a></p>`,
			})
		},
	},
	plugins: [
		adminPlugin({
			ac,
			roles: { user, admin, superadmin },
			defaultRole: "user",
			adminRoles: ["admin", "superadmin"],
		}),
		nextCookies(), // keep last
	],
})

export type Session = typeof auth.$Infer.Session
