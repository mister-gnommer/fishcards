# Tasks

## 1. Scaffold

- [ ] 1.1 Generate the app with `create-cloudflare --framework=next` (TypeScript, App Router, `src/` dir, Tailwind, ESLint) in a temp folder and move it to the repo root without overwriting `README.md`, `LICENSE`, `.claude/`, `openspec/`, `docs/` or `scripts/`; verify `npm run dev` serves the starter page
- [ ] 1.2 Pin every dependency in `package.json` to its exact installed version, pick the newest Next.js that the installed `@opennextjs/cloudflare` supports, add `.nvmrc` (22) and `engines.node`; verify `npm ci` succeeds and `package.json` has no `^`/`~`
- [ ] 1.3 Extend `.gitignore` with `.open-next/`, `.wrangler/`, `.dev.vars*`, `test-results/`, `playwright-report/`; verify `git status` shows no build or test output after a build
- [ ] 1.4 Run `shadcn init` (base setup only, no components); verify `components.json` and the `cn` helper exist and `npm run build` passes

## 2. Workers runtime and D1

- [ ] 2.1 Configure `wrangler.jsonc`: name `fishcards`, `nodejs_compat`, D1 binding `DB` (database `fishcards`, placeholder `database_id`, `migrations_dir: "drizzle"`), custom domain route `fishcards.gnommer.pl`, `workers_dev: false`, no R2/images bindings; verify `npx wrangler deploy --dry-run` succeeds after `opennextjs-cloudflare build`
- [ ] 2.2 Add Drizzle: empty `src/db/schema.ts`, `src/db/index.ts` with a per-request `getDb()` over `getCloudflareContext().env.DB`, `drizzle.config.ts` (sqlite dialect, out `drizzle/`), and npm scripts `db:generate` and `db:migrate:local`; verify `npm run db:generate` runs and `npm run db:migrate:local` applies cleanly to the local D1
- [ ] 2.3 Call `initOpenNextCloudflareForDev()` in `next.config.ts`, run `npm run cf-typegen` and commit `cloudflare-env.d.ts`; verify `npx tsc --noEmit` passes and `env.DB` is typed
- [ ] 2.4 Verify `npm run preview` serves the app in the local Workers runtime

## 3. Localization

- [ ] 3.1 Add next-intl: `src/i18n/routing.ts` (`en`, `pl`, default `en`, `localePrefix: 'always'`), request config, middleware (`src/proxy.ts`, or `src/middleware.ts` if `proxy.ts` doesn't work under `preview`), `messages/en.json` and `messages/pl.json` (English typed as the message source); verify `/` redirects to `/en` and `/pl` renders
- [ ] 3.2 Move the root layout and page under `src/app/[locale]/`: `notFound()` for unsupported locales, `<html lang={locale}>`, a localized home page with the app name and a one-line description, and a header language switcher (next-intl `Link` to the current path in the other locale); verify `/de` returns 404 and the switcher moves between `/en` and `/pl`
- [ ] 3.3 Set up Vitest with a translation-parity test that compares the flattened key sets of `en.json` and `pl.json`; verify it passes, and fails when a key is removed from `pl.json`
- [ ] 3.4 Set up Playwright (Chromium, `webServer` running `npm run preview`) with one test per scenario in `specs/localization/spec.md`: prefixed page, unsupported locale, remembered choice, browser language, English fallback, switch-and-remember, document language; verify `npx playwright test` passes

## 4. CI/CD

- [ ] 4.1 Add `.github/workflows/deploy.yml`: on push to `main`, with `concurrency` set so deploys never overlap, run Node 22, `npm ci`, lint, `tsc --noEmit`, Vitest, Playwright (install Chromium), `wrangler d1 migrations apply DB --remote`, `npm run deploy`, using the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets; verify the workflow YAML is valid and every `npm run` script it calls exists
- [ ] 4.2 Add a "dev setup" section to the README: prerequisites, local commands (`dev`, `preview`, tests, `db:*`), and the owner's one-time steps (wrangler login, `d1 create` plus pasting `database_id`, API token permissions, GitHub secrets); verify each listed command exists in `package.json`

## 5. Integration

- [ ] 5.1 Run lint, typecheck, Vitest and Playwright locally in one go; verify everything is green from a clean `npm ci`
- [ ] 5.2 (Owner) Complete the one-time Cloudflare and GitHub steps from the README and push to `main`; verify the workflow is green and `https://fishcards.gnommer.pl` redirects to a localized home page

## Workflow follow-up

- Run `/opsx:verify`, then archive the change once production is live.
