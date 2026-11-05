# Tasks

## 1. Scaffold

- [x] 1.1 Run `create-next-app` (done in a scratch folder and copied to the repo root, which was not empty) (TypeScript, App Router, `src/` dir, Tailwind, ESLint) without touching `README.md`, `LICENSE`, `.claude/`, `openspec/`, `docs/` or `scripts/`, then `npx @opennextjs/cloudflare migrate`; verify `npm run dev` serves the starter page and `git diff README.md LICENSE` is empty
- [x] 1.2 Pin every dependency in `package.json` to its exact installed version: the newest Next.js within the installed `@opennextjs/cloudflare` peer range (16.4.4 with 1.20.15 as of 2026-11-03; never 16.0–16.4.0), a Wrangler within that range, and stable `drizzle-orm`/`drizzle-kit`. Add `.nvmrc` (22) and `engines.node`; verify `npm ci` succeeds without peer warnings and `package.json` has no `^`/`~`
- [x] 1.3 Extend `.gitignore` with `.open-next/`, `.wrangler/`, `.dev.vars*`, `test-results/`, `playwright-report/`; verify `git status` shows no build or test output after a build
- [x] 1.4 Run `shadcn init` (base setup only, no components); verify `components.json` and the `cn` helper exist and `npm run build` passes

## 2. Workers runtime and D1

- [x] 2.1 Configure `wrangler.jsonc`: name `fishcards`, `nodejs_compat`, D1 binding `DB` (database `fishcards`, placeholder `database_id`, `migrations_dir: "drizzle"`), custom domain route `fishcards.gnommer.pl`, `workers_dev: false`, and remove any R2/images/self-reference bindings and R2 cache config that `migrate` added; verify `npx wrangler deploy --dry-run` succeeds after `opennextjs-cloudflare build`
- [x] 2.2 Add Drizzle: empty `src/db/schema.ts`, `src/db/index.ts` with a per-request `getDb()` over `getCloudflareContext().env.DB`, `drizzle.config.ts` (sqlite dialect, out `drizzle/`), and npm scripts `db:generate` and `db:migrate:local`; verify `npm run db:generate` runs and `npm run db:migrate:local` applies cleanly to the local D1
- [x] 2.3 Call `initOpenNextCloudflareForDev()` in `next.config.ts`, run `npm run cf-typegen` and commit `cloudflare-env.d.ts`; verify `npx tsc --noEmit` passes and `env.DB` is typed
- [x] 2.4 Verify `npm run preview` serves the app in the local Workers runtime

## 3. Localization

- [x] 3.1 Add next-intl: `src/i18n/routing.ts` (`en`, `pl`, default `en`, `localePrefix: 'always'`, `localeCookie: { maxAge: 31536000 }`), request config, middleware (`src/proxy.ts`, or `src/middleware.ts` if `proxy.ts` doesn't work under `preview`), `messages/en.json` and `messages/pl.json` (English typed as the message source); verify `/` redirects to `/en` and `/pl` renders
- [x] 3.2 Move the root layout and page under `src/app/[locale]/`: `notFound()` for unsupported locales, `<html lang={locale}>`, a localized home page with the app name and a one-line description, and a header language switcher (next-intl `Link` to the current path in the other locale); verify `/de` returns 404 and the switcher moves between `/en` and `/pl`
- [x] 3.3 Set up Vitest with a translation-parity test that compares the flattened key sets of `en.json` and `pl.json`; verify it passes, and fails when a key is removed from `pl.json`
- [x] 3.4 Set up Playwright (Chromium, `webServer` running `npm run db:migrate:local` then `npm run preview`) with one test per scenario in `specs/localization/spec.md`: prefixed page, unsupported locale, remembered choice, browser language, English fallback (context locale `de-DE`, since the default is `en-US`), switch-and-remember, choice survives a restart (cookie expires about a year out, and a fresh context with only that cookie lands on `/pl`), document language; verify `npx playwright test` passes

## 4. CI/CD

- [x] 4.1 Add `.github/workflows/deploy.yml`: on push to `main`, with `concurrency` set so deploys never overlap, run Node 22, `npm ci`, lint, `tsc --noEmit`, Vitest, `wrangler d1 migrations apply DB --local` then Playwright (install Chromium), `wrangler d1 migrations apply DB --remote`, `npm run deploy`, using the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets; verify the workflow YAML is valid and every `npm run` script it calls exists
- [x] 4.2 Add a "dev setup" section to the README: prerequisites, local commands (`dev`, `preview`, tests, `db:*`), and the owner's one-time steps (wrangler login, `d1 create fishcards --update-config`, an API token from the "Edit Cloudflare Workers" template plus D1 Edit, GitHub secrets); verify each listed command exists in `package.json`

## 5. Integration

- [x] 5.1 Run lint, typecheck, Vitest and Playwright locally in one go; verify everything is green from a clean `npm ci`
- [x] 5.2 (Owner) Complete the one-time Cloudflare and GitHub steps from the README (D1 database, account ID secret, temporary token for the first deploy) and push to `main`; verify the workflow is green and `https://fishcards.gnommer.pl` redirects to a localized home page
- [x] 5.3 (Owner) Swap the temporary token for the long-lived token scoped to the `fishcards` Worker, then push a change to `main`; verify the deploy is still green and the temporary token is deleted

## 6. Review fixes

- [x] 6.1 Give the deploy workflow a read-only token (`permissions: contents: read`); verify the YAML parses and the token is read-only
- [x] 6.2 Deploy the `.open-next` build the e2e tests ran against (`opennextjs-cloudflare deploy`) instead of rebuilding; verify no rebuild runs after the e2e step
- [x] 6.3 Add security headers in `next.config.ts` and `e2e/security-headers.spec.ts` covering `specs/web-security/spec.md`; verify the test passes under `preview` and the browser console shows no CSP violations
- [x] 6.4 Move `shadcn` to `devDependencies`; verify `npm run build` passes

## Workflow follow-up

- Run `/opsx:verify`, then archive the change once production is live.
