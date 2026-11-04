import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:8787";

// Runs against `preview` (the local Workers runtime), not `next dev`, to catch Workers-only failures.
export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run db:migrate:local && npm run preview",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
