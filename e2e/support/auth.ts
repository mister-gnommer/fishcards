import type { BrowserContext } from "@playwright/test";
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getPlatformProxy } from "wrangler";
import * as schema from "../../src/db/schema";
import { authOptions } from "../../src/auth/options";

/**
 * Signs a fresh user in to the browser context without OAuth: a test-only Better Auth instance
 * (with testUtils, which never ships in src/) writes the user and session straight into the local
 * D1 that `preview` uses, then hands the session cookies to the browser.
 * @param context Playwright browser context to sign in
 * @param email the user's email; use one outside ALLOWED_EMAILS to test a removed user
 * @returns the created user's id and email
 */
export async function signIn(context: BrowserContext, email: string) {
  // Same local D1 persistence and .dev.vars as `wrangler dev` behind `npm run preview`.
  const { env, dispose } = await getPlatformProxy<CloudflareEnv>();
  try {
    const db = drizzle(env.DB, { schema });
    // Emails are unique, and the local D1 outlives test runs: start from a clean user.
    await db.delete(schema.user).where(eq(schema.user.email, email));
    const auth = betterAuth({
      ...authOptions(env, db),
      // The OAuth-time allowlist hook needs an HTTP endpoint context, which saveUser lacks.
      // The app still re-checks the allowlist on every request (getSessionUser).
      user: {},
      plugins: [testUtils()],
    });
    const { test } = await auth.$context;
    const user = test.createUser({ email, name: "E2E User" });
    await test.saveUser(user);
    await context.addCookies(await test.getCookies({ userId: user.id, domain: "localhost" }));
    return { id: user.id, email };
  } finally {
    await dispose();
  }
}
