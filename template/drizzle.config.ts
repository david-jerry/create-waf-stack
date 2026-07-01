import { defineConfig } from "drizzle-kit"

import { config } from "./src/config"

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/models",
	dialect: "postgresql",
	casing: "snake_case",
	verbose: true,
	strict: false,
	schemaFilter: ["public"],
	dbCredentials: { url: config.DATABASE_URL },
})
