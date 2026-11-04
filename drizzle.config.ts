import { defineConfig } from "drizzle-kit";

// Generate-only: migrations are applied by `wrangler d1 migrations apply`.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
});
