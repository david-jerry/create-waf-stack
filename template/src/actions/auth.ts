"use server"

import { eq } from "drizzle-orm"

import db from "@/db"
import { user } from "@/db/models"
import { CLogger } from "@/lib/logger"
import { requireSuperAdmin } from "@/lib/guard"
import type { ActionResult } from "@/types/api"

/**
 * Example mutation. Demonstrates the action pattern every domain follows:
 *   authorize (guard) → act (db) → return the standard envelope.
 *
 * Promoting a user is privilege-sensitive, so it's superadmin-only — the guard
 * runs first, because proxy.ts only protects navigation, not action calls.
 */
export async function promoteToAdmin(userId: string): Promise<ActionResult<{ id: string }>> {
	if (!(await requireSuperAdmin())) {
		return { status: false, data: null, error: "Unauthorized" }
	}
	try {
		const [updated] = await db.update(user).set({ role: "admin" }).where(eq(user.id, userId)).returning()
		if (!updated) return { status: false, data: null, error: "User not found" }
		return { status: true, data: { id: updated.id }, message: "User promoted to admin." }
	} catch (error) {
		const reason = error instanceof Error ? error.message : "Failed to promote user"
		CLogger.error(`[promoteToAdmin] ${reason}`)
		return { status: false, data: null, error: reason }
	}
}
