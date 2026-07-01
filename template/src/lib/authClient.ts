import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { config } from "@/config"

export const authClient = createAuthClient({
	baseURL: config.BASE_URL,
	plugins: [adminClient()],
})

export const { signIn, signUp, signOut, useSession } = authClient
