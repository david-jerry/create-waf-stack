import { Pool as NeonPool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool as PgPool } from "pg"

import { config } from "@/config"
import * as schemas from "@/db/models"

/**
 * Dual-driver Drizzle instance.
 *  - Development: node-postgres `pg` Pool (generous timeouts for Neon cold starts).
 *  - Production: Neon serverless Pool (scale-to-zero). API-compatible with pg,
 *    so both run through the node-postgres adapter.
 */
let pool: PgPool

if (config.NODE_ENV === "development") {
	pool = new PgPool({
		connectionString: config.DATABASE_URL,
		max: 5,
		idleTimeoutMillis: 20000,
		connectionTimeoutMillis: 15000,
		keepAlive: true,
	})
} else {
	pool = new NeonPool({ connectionString: config.DATABASE_URL }) as unknown as PgPool
}

const db = drizzle(pool, {
	schema: schemas,
	casing: "snake_case",
	logger: config.NODE_ENV === "development",
})

export default db
export type DbConfig = typeof db
