# Proposal

## Why

Every feature after this one (sets, cards, learning sessions) stores data that belongs to one person, so the app needs to know who is using it. The planning interview settled how: Google or GitHub sign-in through Better Auth, and no open sign-up, only emails the owner has put on an allowlist (`docs/grilling-ledger.md` Q2, Q3, Q9, Q10, Q23). Auth is its own change so the owner can review it line by line.

## What Changes

- Sign-in with Google or GitHub via Better Auth, with sessions stored in D1 (`user`, `session`, `account`, `verification` tables and their first migration).
- An email allowlist read from the `ALLOWED_EMAILS` Worker secret. Only verified emails on the list get in. The list is checked again on every request, so removing an email ends that person's access at once.
- The same verified email on both providers means one account (Better Auth's implicit linking, which only links verified emails).
- Sign-out, a signed-in header (email and sign-out button), and a localized message when access is denied.
- The landing page shows the two sign-in buttons. A first protected page, `/[locale]/sets`, is an empty "Your sets" placeholder that `sets-and-cards` fills in.
- A test-only Better Auth instance with the `testUtils` plugin lets Playwright sign in without a real OAuth provider. It is never part of the production config.
- Worker secrets and OAuth apps documented as owner steps.

**Out of scope:** an admin UI and moving the allowlist into D1 ([mister-gnommer/fishcards#1](https://github.com/mister-gnommer/fishcards/issues/1)), user avatars, account settings, manual account linking or unlinking, email/password or passkeys, nonce-based CSP (planned for `sets-and-cards`), and the sets and cards themselves.

## Capabilities

### New Capabilities

- `user-auth`: signing in with Google or GitHub, the email allowlist, account linking, sessions, signing out, and keeping protected pages for signed-in users.

### Modified Capabilities

None. New texts fall under the existing `localization` requirements (both languages, parity test) without changing them.

## Impact

- **New code:** `src/auth/` (server instance, client, allowlist check, session helper), `src/app/api/auth/[...all]/route.ts`, Better Auth tables in `src/db/`, the first SQL migration in `drizzle/`, sign-in and header components, `src/app/[locale]/sets/page.tsx`, unit and e2e tests.
- **New dependency (exact version):** `better-auth` (1.7.17 at planning time; peer ranges cover the installed Next.js, Drizzle and Vitest).
- **Cloudflare:** five Worker secrets (`BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`) plus `ALLOWED_EMAILS`, and a `BETTER_AUTH_URL` variable. The first migration creates tables in `fishcards-db`.
- **Owner setup:** a Google OAuth client and two GitHub OAuth apps (production and local), whose credentials go into the Worker secrets.
- **CI:** Playwright needs local auth secrets. CI writes a throwaway `.dev.vars` before the e2e step.
