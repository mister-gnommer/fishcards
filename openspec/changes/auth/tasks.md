# Tasks

## 1. Spike: Playwright sign-in through `testUtils`

- [ ] 1.1 Install `better-auth` (exact version). In a throwaway branch of the work, build a minimal test-only instance in `e2e/support/auth.ts` (`testUtils()` plus a D1 binding from Wrangler's `getPlatformProxy()`), create a user and session against preview's local D1, inject the cookies into a Playwright context, and call `/api/auth/get-session` on `preview`; verify it returns that user. If it can't work, stop and bring the alternatives to the owner before continuing

## 2. Schema and auth core

- [ ] 2.1 Generate Better Auth's core tables (`user`, `session`, `account`, `verification`) as Drizzle schema in `src/db/auth-schema.ts`, export it from `src/db/schema.ts`, and run `npm run db:generate`; verify `drizzle/` has one migration creating those four tables and `npm run db:migrate:local` applies it
- [ ] 2.2 Add `src/auth/allowlist.ts` with `isAllowed(email, emailVerified, rawList)` and its Vitest tests (empty list, case and spaces, unverified, missing email); verify `npm test` passes
- [ ] 2.3 Add `src/auth/options.ts` (`authOptions(env, db)`: Drizzle adapter, Google and GitHub, `baseURL` and `trustedOrigins` from `BETTER_AUTH_URL`, `secret`, `user.validateUserInfo` with `isAllowed()`, `nextCookies()` last) and `src/auth/server.ts` (`getAuth()` per request); check in the Better Auth source or docs that `validateUserInfo` receives `emailVerified`, else apply the `requireEmailVerification` fallback from design; verify `npm run typecheck` passes
- [ ] 2.4 Add `BETTER_AUTH_URL` to `wrangler.jsonc` `vars`, commit `.dev.vars.example` with every auth key and dummy values, and run `npm run cf-typegen`; verify `env.BETTER_AUTH_SECRET` and `env.ALLOWED_EMAILS` are typed
- [ ] 2.5 Add `src/app/api/auth/[...all]/route.ts` and `src/auth/session.ts` (`getSessionUser()` with the allowlist re-check); verify under `preview` that `/api/auth/get-session` answers and `/api/auth/sign-in/social` returns a provider redirect URL

## 3. Pages and UI

- [ ] 3.1 Add `src/auth/client.ts`, the sign-in buttons on the landing page (callback `/<locale>/sets`, error callback `/<locale>`), the localized no-access message for `?error=`, and the redirect of signed-in users to `/<locale>/sets`; add the en/pl texts; verify `npm test` (parity) passes
- [ ] 3.2 Add the protected `src/app/[locale]/sets/page.tsx` placeholder and the signed-in header (email and sign-out button that ends the session and returns to `/<locale>`); verify a signed-out visit to `/pl/sets` redirects to `/pl` under `preview`
- [ ] 3.3 Turn the spike into `e2e/support/auth.ts` (test-only instance from `authOptions()` plus `testUtils()`) and add `e2e/auth.spec.ts`: signed-out landing page shows both buttons, signed-out `/pl/sets` redirects, signed-in `/en/sets` shows the email, sign-out ends the session, a session whose email isn't on the allowlist is treated as signed out, `?error=access_denied` shows the no-access message; verify `npx playwright test` passes, including the existing localization and security tests

## 4. CI and docs

- [ ] 4.1 In `.github/workflows/ci.yml`, write `.dev.vars` from `.dev.vars.example` with a random `BETTER_AUTH_SECRET` and `ALLOWED_EMAILS=e2e@example.com` before the e2e step; verify the PR's `ci` check passes
- [ ] 4.2 Add the auth owner steps to the README (Google OAuth client and redirect URIs, two GitHub OAuth apps, the six Worker secrets in the dashboard, local `.dev.vars`); verify every key in `.dev.vars.example` is mentioned

## Workflow follow-up

- Run `/opsx:verify` and a code review before marking the PR ready.
- Owner, before merge: create the OAuth apps and set the Worker secrets (README).
- After merge and deploy: sign in with Google and GitHub using the same email (one account), and try an email that isn't on the allowlist.
- Archive the change after the manual checks pass.
