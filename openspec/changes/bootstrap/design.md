# Design

## Context

The repo has no app code yet: just docs, `openspec/`, `scripts/` and AI tooling. The stack and hosting were settled in the planning interview (`docs/grilling-ledger.md`). The behavior this change must deliver is in `specs/localization/spec.md`. Everything else here is infrastructure that later changes build on.

The agent implementing this has no Cloudflare credentials, so anything that touches the owner's Cloudflare account (creating the D1 database, the first deploy, GitHub secrets) is an owner step.

## Goals / Non-Goals

**Goals:**
- `npm run dev`, `npm run preview` and the CI deploy all work from a fresh clone with only the documented owner steps done.
- Later changes add tables, pages and tests without touching build, deploy or i18n plumbing.

**Non-Goals:**
- No database tables. The schema file and migrations folder exist but are empty.
- No incremental cache (R2), image optimization binding or preview environment. Every page renders on request.
- No shadcn/ui components yet. Only the base setup (`components.json`, `cn` helper, theme CSS), so `auth` can add the first ones.

## Decisions

### Scaffold with the Cloudflare Next.js template, then move it to the repo root
Generate the app with `create-cloudflare` (`--framework=next`) in a temporary folder, then move it into the repo root next to the existing files and pin every dependency to its exact installed version.
- **Why:** it is the officially supported way to get OpenNext, `wrangler.jsonc`, `open-next.config.ts` and the `preview`/`deploy` scripts wired up together.
- **Alternative:** `create-next-app` plus manually adding OpenNext. Same result, but more hand-written config to get wrong.
- **Alternative:** app in a subfolder (`app/`). Rejected: the repo is a single app, and a subfolder adds `cd` and path config everywhere.

### Next.js version and middleware file
Use the newest Next.js major that the current `@opennextjs/cloudflare` release supports. On Next.js 16+, the next-intl middleware lives in `src/proxy.ts`; on earlier versions, `src/middleware.ts`.

### D1 through `getCloudflareContext` and Drizzle; migrations applied by Wrangler
- Bind the database as `DB` in `wrangler.jsonc`.
- `src/db/index.ts` exports a per-request `getDb()` (React `cache`) that wraps `getCloudflareContext().env.DB` with `drizzle()`.
- The schema goes in `src/db/schema.ts`. `drizzle-kit generate` writes SQL migrations to `drizzle/`, and `wrangler.jsonc` points `migrations_dir` there.
- Migrations are applied with `wrangler d1 migrations apply DB` (`--local` for dev, `--remote` in CI).
- **Why Wrangler applies them:** D1 is only reachable through Wrangler or the Cloudflare HTTP API. Wrangler also tracks which migrations have run, so CI can call it on every deploy.
- **Alternative:** `drizzle-kit push`/`migrate` over the D1 HTTP API. Rejected: it needs extra credentials in drizzle config and gives no migration history in D1.
- `initOpenNextCloudflareForDev()` in `next.config.ts` makes the local D1 available in `next dev`.

### i18n: next-intl with prefix routing and its built-in detection
- `src/i18n/routing.ts` sets locales `['en', 'pl']`, `defaultLocale: 'en'` and `localePrefix: 'always'`. Pages live under `src/app/[locale]/`.
- next-intl's middleware already gives the detection order the spec requires (URL prefix, then `NEXT_LOCALE` cookie, then `Accept-Language`, then default). Opening a prefixed URL also updates the cookie, so we write no custom detection code.
- `[locale]/layout.tsx` calls `notFound()` for unsupported locales and sets `<html lang={locale}>`.
- The language switcher is next-intl's `Link` with `locale` set to the other language, pointing at the current pathname. Because visiting a prefixed URL updates the cookie, "remember my choice" needs no extra code.
- Translations live in `messages/en.json` and `messages/pl.json`. English is the source for next-intl's TypeScript message types, so a missing English key fails `tsc`.
- A Vitest test compares the flattened key sets of `en.json` and `pl.json`, so a missing Polish key fails CI too.
- **Alternative:** a hand-rolled dictionary and middleware. Rejected: more code, the same behavior, and no ICU plurals (Polish needs them for card counts).

### Styling: Tailwind and shadcn/ui base only
Use whatever Tailwind version the template sets up, then run `shadcn init`. No custom theme.

### Tests
- **Vitest** (Node environment) runs the translation-parity test, and later all logic tests. `--passWithNoTests` isn't needed, because the parity test exists.
- **Playwright** (Chromium only) runs against `npm run preview`, so the end-to-end tests exercise the real Workers runtime rather than `next dev`. Each scenario in `specs/localization/spec.md` gets a test. Browser language is set with the context `locale` option, and the remembered choice is tested by switching through the UI and then opening `/`.

### CI/CD: one GitHub Actions workflow on `main`
`.github/workflows/deploy.yml` runs on every push to `main`, with `concurrency` set so that deploys never overlap. It runs these steps in order:
1. Node 22 setup and `npm ci`.
2. Lint.
3. `tsc --noEmit`.
4. Vitest.
5. Playwright (installing Chromium first).
6. `wrangler d1 migrations apply DB --remote`.
7. `npm run deploy`.

Credentials come from the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets. A failing step stops the deploy.

### Custom domain in `wrangler.jsonc`
- `routes: [{ "pattern": "fishcards.gnommer.pl", "custom_domain": true }]` makes Cloudflare create the DNS record and certificate on deploy.
- `workers_dev: false`, so the app has a single public URL. That matters once OAuth callbacks exist.

### Generated Cloudflare types are committed
Generate `cloudflare-env.d.ts` with `npm run cf-typegen` and commit it. Typecheck in CI then doesn't need Wrangler to run first.

## Risks / Trade-offs

- [OpenNext may not support the newest Next.js release or its `proxy.ts`] → Pin Next.js to the newest version OpenNext supports, and keep `middleware.ts` if `proxy.ts` doesn't work under `preview`.
- [Playwright against `preview` builds the whole app, so CI is slower] → The suite is a handful of tests, and catching Workers-only failures before deploy is worth a minute.
- [The first deploy creates the custom domain, which can fail if a DNS record for `fishcards` already exists] → It doesn't exist (checked on 2026-11-03). If the deploy fails, the owner removes the conflicting record.
- [The D1 database ID is in `wrangler.jsonc`] → The ID isn't a secret. Access is controlled by the API token.
- [There's no staging environment, so a bad deploy hits production] → CI runs every check before deploying, and `wrangler rollback` restores the previous version.

## Migration Plan

Owner steps, once:
1. Run `npx wrangler login`, then `npx wrangler d1 create fishcards`, and paste the returned `database_id` into `wrangler.jsonc`.
2. Create a Cloudflare API token with Workers Scripts edit, D1 edit and Workers Routes edit permissions on the `gnommer.pl` zone. Add it and the account ID as the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.
3. Push to `main`. CI deploys and `fishcards.gnommer.pl` goes live.

**Rollback:** `npx wrangler rollback` restores the previous Worker version. This change has no data, so there's nothing to migrate back.
