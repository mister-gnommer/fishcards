import { defineConfig } from "vitest/config";

// e2e/ holds Playwright specs; Vitest only runs unit tests next to the code.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
