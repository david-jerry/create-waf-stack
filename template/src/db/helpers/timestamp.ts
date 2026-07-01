import { timestamp } from "drizzle-orm/pg-core"

/** Shared created/updated columns. Spread into any table definition. */
export const timestamps = {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}
