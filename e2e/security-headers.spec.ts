import { expect, test } from "@playwright/test";

// Guards against the adapter or a config change silently dropping next.config `headers()`.
test("pages are served with the security headers", async ({ page }) => {
  const response = await page.goto("/en");
  const headers = response?.headers() ?? {};
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["strict-transport-security"]).toContain("max-age=");
});
