import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { isAllowed } from "./allowlist";

/**
 * Better Auth settings shared by the app and the test-only instance in e2e/support,
 * so both read users and sign session cookies the same way. Plugins are added by each caller.
 * @param env the Worker's bindings and secrets
 * @param db Drizzle client over the request's D1 binding
 */
export function authOptions(env: CloudflareEnv, db: DrizzleD1Database<typeof schema>) {
  return {
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.BETTER_AUTH_URL],
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    socialProviders: {
      google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
      github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
    },
    // Provider tokens are stored but never used; encrypt them so a leaked D1 doesn't leak GitHub/Google access.
    account: { encryptOAuthTokens: true },
    user: {
      // Runs on account creation, linking and every OAuth sign-in, with the provider's fresh data.
      validateUserInfo: ({ user }) =>
        isAllowed(user.email, user.emailVerified, env.ALLOWED_EMAILS)
          ? undefined
          : { error: "access_denied" },
    },
  } satisfies BetterAuthOptions;
}
