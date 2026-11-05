# Proposal

## Why

Fishcards has docs and planning but no code. Every MVP change after this one (`auth`, `sets-and-cards`, `learning-session`) needs the same base: the app running on Cloudflare Workers with D1, translated into English and Polish, with tests, and deployed from `main` to `fishcards.gnommer.pl`. Building that base first and on its own lets each feature change stay about the feature.

## What Changes

- New Next.js (App Router, TypeScript) app at the repo root, built for Cloudflare Workers with the OpenNext adapter.
- D1 database bound to the Worker, with Drizzle and an (empty) migrations folder, usable from `next dev` and in production.
- Tailwind and shadcn/ui set up, with no custom design.
- next-intl with the locale in the URL (`/en`, `/pl`): `/` redirects to the remembered or browser language, and a language switcher is shown on every page.
- One localized home page with the app name and a one-line description.
- Vitest (logic tests) and Playwright (end-to-end tests) set up, with tests for the localization behavior.
- Baseline security headers on every response: a Content Security Policy without nonces, HSTS, `nosniff`, and frame and referrer policies.
- GitHub Actions on push to `main`: lint, typecheck, tests, D1 migrations, deploy to `fishcards.gnommer.pl`, with a read-only GitHub token; the deployed build is the one the end-to-end tests ran against.

**Out of scope:** sign-in and any user data (`auth`), sets and cards, learning sessions, the final look (colors, dark cards, logo, flip animation), favicon and branding, the demo, preview environments, and analytics.

## Capabilities

### New Capabilities

- `localization`: interface languages (English and Polish), locale in the URL, detecting and remembering the user's language, switching it, and keeping both translations complete.
- `web-security`: the browser-hardening headers the app sends with every page.

### Modified Capabilities

None. There are no existing specs.

## Impact

- **New code:** the whole app skeleton at the repo root (`src/`, `messages/`, `e2e/`, config files). The existing `openspec/`, `docs/`, `scripts/` and `.claude/` stay as they are.
- **New dependencies (exact versions):** `next`, `react`, `react-dom`, `@opennextjs/cloudflare`, `wrangler`, `drizzle-orm`, `drizzle-kit`, `next-intl`, `tailwindcss`, the shadcn/ui base packages, `vitest`, `@playwright/test`, and the TypeScript and ESLint tooling from the Next.js starter.
- **Cloudflare (owner's account):** a Worker named `fishcards`, a D1 database `fishcards-db`, and a custom domain `fishcards.gnommer.pl` (the `gnommer.pl` zone is already on Cloudflare).
- **GitHub:** a deploy workflow that needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets, which the owner adds.
