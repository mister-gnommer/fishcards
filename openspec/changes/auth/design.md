# Design

## Context

`bootstrap` left the app with D1 bound as `DB`, a per-request Drizzle client (`src/db/index.ts`), next-intl routing in `src/proxy.ts`, security headers in `next.config.ts`, and a CI pipeline that runs Playwright against `preview` before deploying. The behavior to build is in `specs/user-auth/spec.md`, and the decisions behind it are in `docs/grilling-ledger.md` (Q2, Q3, Q9, Q10, Q23).

On Workers, bindings and secrets live in the request context (`getCloudflareContext().env`), not in `process.env` at module load. That shapes how the auth instance is built.

## Goals / Non-Goals

**Goals:**
- Auth code stays small and in one place (`src/auth/`), so the owner can review all of it.
- Later changes protect a page with one call (`getSessionUser()`) and get the user id for their queries.

**Non-Goals:**
- No optimistic cookie check in `proxy.ts`. Every protected page validates the session on the server anyway, so a second, weaker check adds code without adding safety.
- No avatars: `img-src 'self'` would block provider images, and nothing needs them yet.
- No changes to the CSP. OAuth uses top-level navigations, which the current policy allows.

## Decisions

### Auth instance built per request from the request's bindings
`src/auth/server.ts` exports `getAuth()`, wrapped in React `cache` like `getDb()`. It builds `betterAuth(authOptions(env, db))` from `getCloudflareContext().env` and `getDb()`. `authOptions()` is a plain function shared with the test-only instance (see Tests), so both sign cookies and read users the same way.
- **Alternative:** a module-level `auth` as in Better Auth's examples. Rejected: env and the D1 binding are not available at module load on Workers.

### Better Auth configuration
- `database`: Drizzle adapter, provider `sqlite`, with the auth tables from `src/db/`.
- `socialProviders`: `google` and `github`, client ids and secrets from Worker secrets.
- `baseURL`: the `BETTER_AUTH_URL` variable (`https://fishcards.gnommer.pl` in `wrangler.jsonc` `vars`, `http://localhost:8787` in `.dev.vars`). `trustedOrigins` is that one origin, so production never trusts localhost.
- `secret`: the `BETTER_AUTH_SECRET` Worker secret.
- `user.validateUserInfo`: rejects with `access_denied` unless `isAllowed()` passes. It runs on account creation, on linking and on every OAuth sign-in, so it also catches a provider email that later changed.
- Account linking: Better Auth's default implicit linking, which only links when the provider reports the email as verified. No `trustedProviders`, and no `updateUserInfoOnLink`.
- Session: defaults (7 days, refreshed daily). Cookie cache stays off, so sign-out and allowlist removals take effect on the next request.
- Rate limiting: Better Auth's default (on in production, in-memory per isolate). That's weak across isolates, but sign-in is OAuth-only and allowlisted, so there are no passwords to guess. Revisit if email/password is ever added.
- `nextCookies()` as the last plugin, so cookies set from server code reach the browser.

### Allowlist check is one pure function
`src/auth/allowlist.ts` exports `isAllowed(email, emailVerified, rawList)`: it trims and lowercases both sides, returns false for an empty list, and returns false when `emailVerified` is false. Being pure makes it unit-testable without Better Auth.
- If `validateUserInfo` turns out not to receive `emailVerified`, set `requireEmailVerification: true` on both providers instead and keep the list check. Both reach the spec's "unverified email" outcome.

### Session access goes through `getSessionUser()`
`src/auth/session.ts` exports `getSessionUser()`. It calls `auth.api.getSession({ headers })` and returns `null` unless the session exists **and** `isAllowed()` still passes. This is the per-request allowlist check from the spec. Protected pages call it and `redirect()` to the landing page when it returns `null`. The landing page calls it and redirects signed-in users to `/[locale]/sets`.

### Routes and UI
- `src/app/api/auth/[...all]/route.ts`: `toNextJsHandler(getAuth().handler)`. `/api` is already outside the next-intl matcher.
- `src/auth/client.ts`: `createAuthClient()` from `better-auth/react`.
- A sign-in buttons client component calls `signIn.social({ provider, callbackURL: "/<locale>/sets", errorCallbackURL: "/<locale>" })`, so the user stays in the language they started from. Better Auth appends `?error=…` to the error URL, and the landing page turns any error into the localized no-access message.
- The header shows the email and a sign-out button when `getSessionUser()` returns a user. Sign-out calls `signOut()`, then navigates to `/<locale>`.
- `src/app/[locale]/sets/page.tsx` is a protected "Your sets" placeholder that `sets-and-cards` replaces.
- All new texts are added to `messages/en.json` and `messages/pl.json`. The parity test covers them.

### Schema and the first migration
Generate the Drizzle schema for Better Auth's core tables (`user`, `session`, `account`, `verification`) with Better Auth's CLI into `src/db/auth-schema.ts` and export it from `src/db/schema.ts`. Then `npm run db:generate` writes the first SQL migration to `drizzle/`, and CI applies it to `fishcards-db` on merge. If the CLI cannot load the binding-based config in Node, write the schema from Better Auth's documented core schema instead; `drizzle-kit generate` output then shows whether the tables match.

### Secrets and configuration
- Worker secrets: `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and `ALLOWED_EMAILS`. The owner sets them in the dashboard (Worker → Settings → Variables and Secrets), so no local clone is needed.
- `wrangler.jsonc` `vars` holds `BETTER_AUTH_URL`. It isn't secret.
- `.dev.vars.example` is committed with every key and dummy values (`.gitignore` already allows it). `npm run cf-typegen` regenerates the env types after the change.
- GitHub OAuth apps allow only one callback URL, so production and local each get their own app. Google allows several redirect URIs on one client.
- Local OAuth sign-in works through `npm run preview` (port 8787, matching `BETTER_AUTH_URL`). With `next dev` on port 3000 it needs `BETTER_AUTH_URL` changed in `.dev.vars`. Tests don't use real OAuth either way.

### Tests
- **Vitest:** `isAllowed()` covers the empty list, case and spaces, unverified emails and a missing email.
- **Playwright sign-in without OAuth:** `e2e/support/auth.ts` builds a test-only instance, `betterAuth({ ...authOptions(env, db), plugins: [testUtils()] })`. It reaches the same local D1 and `.dev.vars` that `preview` uses through Wrangler's `getPlatformProxy()`. It creates a user, then adds the session cookies to the browser context with `getCookies({ userId, domain: "localhost" })`. `testUtils` is never in `src/`, so it can't ship.
  - This cross-process setup isn't documented. Task 1 is a spike that proves it before anything else is built on it.
- **e2e scenarios:** the signed-out landing page shows both buttons, a signed-out visit to `/pl/sets` redirects, a signed-in visit shows the email, sign-out works, a user removed from the allowlist is treated as signed out (sign in as an email that isn't on the test allowlist), and an `?error=` landing page shows the no-access message. The real OAuth round trip and linking can't be automated without provider accounts, so the owner checks them manually after deploy.
- **CI:** before the e2e step, write `.dev.vars` from `.dev.vars.example` with a random `BETTER_AUTH_SECRET` and `ALLOWED_EMAILS=e2e@example.com`.

## Risks / Trade-offs

- [`testUtils` from a separate Node process may not reach preview's local D1 or produce cookies preview accepts] → The task 1 spike decides it before other work. If it fails, implementation pauses and the alternatives go to the owner.
- [`validateUserInfo` may not see `emailVerified`] → Fall back to `requireEmailVerification: true` on both providers (see Allowlist).
- [D1 has no interactive transactions] → Better Auth's Drizzle adapter works without `transaction: true`. Leave it off.
- [Google's consent screen in "Testing" mode only lets listed test users sign in] → Add the allowlisted emails as test users, or publish the app. Basic profile and email scopes don't need verification.
- [The in-memory rate limit doesn't hold across isolates] → Accepted for OAuth-only sign-in (see Better Auth configuration).

## Migration Plan

1. Owner, before merge:
   - Create a Google OAuth client with redirect URIs `https://fishcards.gnommer.pl/api/auth/callback/google` and `http://localhost:8787/api/auth/callback/google`.
   - Create two GitHub OAuth apps with callbacks `https://fishcards.gnommer.pl/api/auth/callback/github` and `http://localhost:8787/api/auth/callback/github`.
   - Set the six Worker secrets in the dashboard.
2. Merge: CI applies the first migration to `fishcards-db`, then deploys.
3. Owner, after deploy: sign in with both providers using the same email and check that it's one account. Try an email that isn't on the allowlist.

**Rollback:** `npx wrangler rollback` restores the previous Worker. The new tables are unused by the old version, so they can stay.
