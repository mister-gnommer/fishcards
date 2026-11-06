# Tasks

## 1. Spike: Playwright sign-in through `testUtils`

- [x] 1.1 Install `better-auth` (exact version). In a throwaway branch of the work, build a minimal test-only instance in `e2e/support/auth.ts` (`testUtils()` plus a D1 binding from Wrangler's `getPlatformProxy()`), create a user and session against preview's local D1, inject the cookies into a Playwright context, and call `/api/auth/get-session` on `preview`; verify it returns that user. If it can't work, stop and bring the alternatives to the owner before continuing

## 2. Schema and auth core

- [x] 2.1 Generate Better Auth's core tables (`user`, `session`, `account`, `verification`) as Drizzle schema in `src/db/auth-schema.ts`, export it from `src/db/schema.ts`, and run `npm run db:generate`; verify `drizzle/` has one migration creating those four tables and `npm run db:migrate:local` applies it
- [x] 2.2 Add `src/auth/allowlist.ts` with `isAllowed(email, emailVerified, rawList)` and its Vitest tests (empty list, case and spaces, unverified, missing email); verify `npm test` passes
- [x] 2.3 Add `src/auth/options.ts` (`authOptions(env, db)`: Drizzle adapter, Google and GitHub, `baseURL` and `trustedOrigins` from `BETTER_AUTH_URL`, `secret`, `user.validateUserInfo` with `isAllowed()`, `nextCookies()` last) and `src/auth/server.ts` (`getAuth()` per request); check in the Better Auth source or docs that `validateUserInfo` receives `emailVerified`, else apply the `requireEmailVerification` fallback from design; verify `npm run typecheck` passes
- [x] 2.4 Add `BETTER_AUTH_URL` to `wrangler.jsonc` `vars`, commit `.dev.vars.example` with every auth key and dummy values, and run `npm run cf-typegen`; verify `env.BETTER_AUTH_SECRET` and `env.ALLOWED_EMAILS` are typed
- [x] 2.5 Add `src/app/api/auth/[...all]/route.ts` and `src/auth/session.ts` (`getSessionUser()` with the allowlist re-check); verify under `preview` that `/api/auth/get-session` answers and `/api/auth/sign-in/social` returns a provider redirect URL

## 3. Pages and UI

- [x] 3.1 Add `src/auth/client.ts`, the sign-in buttons on the landing page (callback `/<locale>/sets`, error callback `/<locale>`), the localized no-access message for `?error=`, and the redirect of signed-in users to `/<locale>/sets`; add the en/pl texts; verify `npm test` (parity) passes
- [x] 3.2 Add the protected `src/app/[locale]/sets/page.tsx` placeholder and the signed-in header (email and sign-out button that ends the session and returns to `/<locale>`); verify a signed-out visit to `/pl/sets` redirects to `/pl` under `preview`
- [x] 3.3 Turn the spike into `e2e/support/auth.ts` (test-only instance from `authOptions()` plus `testUtils()`) and add `e2e/auth.spec.ts`: signed-out landing page shows both buttons, signed-out `/pl/sets` redirects, signed-in `/en/sets` shows the email, sign-out ends the session, a session whose email isn't on the allowlist is treated as signed out, `?error=access_denied` shows the no-access message; verify `npx playwright test` passes, including the existing localization and security tests

## 4. CI and docs

- [x] 4.1 In `.github/workflows/ci.yml`, write `.dev.vars` from `.dev.vars.example` with a random `BETTER_AUTH_SECRET` and `ALLOWED_EMAILS=e2e@example.com` before the e2e step; verify the PR's `ci` check passes
- [x] 4.2 Add the auth owner steps to the README (Google OAuth client and redirect URIs, two GitHub OAuth apps, the six Worker secrets in the dashboard, local `.dev.vars`); verify every key in `.dev.vars.example` is mentioned

## 5. Review fixes

- [x] 5.1 Encrypt stored provider OAuth tokens (`account.encryptOAuthTokens`); verify the e2e suite still passes
- [x] 5.2 Cache `getSessionUser()` per render so the header and page share one session lookup; verify typecheck and e2e pass
- [x] 5.3 Add an e2e test that the GitHub button starts OAuth with our callback URL (navigation to GitHub intercepted); verify it passes
- [x] 5.4 Add `src/env.ts` with `getEnv()` and use it in `getDb()`, `getAuth()` and `getSessionUser()`; add an ESLint `no-restricted-imports` rule for `@opennextjs/cloudflare` outside `src/env.ts`; verify lint, typecheck and e2e pass
- [x] 5.5 Make sign-out check the `signOut()` result: on an error or a thrown failure, stay on the page and show a localized "Couldn't sign out" message (en and pl); add an e2e test with the sign-out request failing; verify `npm test` and e2e pass

## Workflow follow-up

- Run `/opsx:verify` and a code review before marking the PR ready.
- Owner, before merge: create the OAuth apps and set the Worker secrets (README).
- After merge and deploy: sign in with Google and GitHub using the same email (one account), try an email that isn't on the allowlist, and check that the `account` row's tokens are not stored in plain text.
- Archive the change as the last commit of the PR, after CI is green and verify is clean; the manual checks run after merge and any failure becomes a new fix change.
