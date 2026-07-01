import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements, adminAc, userAc } from "better-auth/plugins/admin/access"

/**
 * Access-control statements + roles. Extend `statements` with your own
 * resources, e.g. `item: ["create", "update", "delete", "list"]`.
 */
const statements = {
	...defaultStatements,
} as const

export const ac = createAccessControl(statements)

export const user = ac.newRole({ ...userAc.statements })
export const admin = ac.newRole({ ...adminAc.statements })
export const superadmin = ac.newRole({ ...adminAc.statements })
