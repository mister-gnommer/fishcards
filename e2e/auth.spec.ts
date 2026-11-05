import { expect, test } from "@playwright/test";
import { signIn } from "./support/auth";

// Must match ALLOWED_EMAILS in .dev.vars (copied from .dev.vars.example).
const ALLOWED = "e2e@example.com";

// The tests share users in one local D1, so run them one at a time.
test.describe.configure({ mode: "serial" });

test("signed-out landing page offers Google and GitHub sign-in", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in with GitHub" })).toBeVisible();
});

test("the sign-in button starts GitHub's OAuth flow with our callback", async ({ page }) => {
  // Stop at GitHub's door: the test only checks that the browser is sent there correctly.
  await page.route("https://github.com/**", (route) => route.abort());
  await page.goto("/en");
  const authorize = page.waitForRequest(/^https:\/\/github\.com\/login\/oauth\/authorize/);
  await page.getByRole("button", { name: "Sign in with GitHub" }).click();
  const url = new URL((await authorize).url());
  expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:8787/api/auth/callback/github");
});

test("a signed-out visit to a protected page redirects to the landing page", async ({ page }) => {
  await page.goto("/pl/sets");
  await expect(page).toHaveURL("/pl");
});

test("a signed-in user sees their email and is sent from the landing page to their sets", async ({
  page,
  context,
}) => {
  await signIn(context, ALLOWED);
  await page.goto("/en/sets");
  await expect(page.getByRole("heading", { name: "Your sets" })).toBeVisible();
  await expect(page.getByText(ALLOWED)).toBeVisible();

  await page.goto("/en");
  await expect(page).toHaveURL("/en/sets");
});

test("signing out ends the session", async ({ page, context }) => {
  await signIn(context, ALLOWED);
  await page.goto("/en/sets");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/en");

  await page.goto("/en/sets");
  await expect(page).toHaveURL("/en");
});

test("a session whose email is no longer on the allowlist is treated as signed out", async ({
  page,
  context,
}) => {
  await signIn(context, "removed@example.com");
  await page.goto("/en/sets");
  await expect(page).toHaveURL("/en");
});

test("a rejected sign-in shows the no-access message", async ({ page }) => {
  await page.goto("/pl?error=access_denied");
  // Next.js adds its own empty role="alert" route announcer, so match the message itself.
  await expect(page.getByRole("alert").filter({ hasText: "To konto nie ma dostępu do Fishcards." })).toBeVisible();
});
