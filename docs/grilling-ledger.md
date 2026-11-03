## Grilling ledger

Decision record from the planning interview.

- ✅ = final answer explicitly chosen by the user.
- ◐ = final outcome derived from a conditional answer or accepted follow-up.
- ↪ = an earlier answer that was later corrected or superseded.

### Elevated decisions

_None yet._

### Round 1 — Foundations

#### Q1 — MVP scope

- ✅ **A — Login, sets, card add/edit/hide/remove, learning session with summary.** AI, stats, spaced repetition, import/export and demo follow as separate changes.
- B — A + basic stats view.
- C — B + AI card generation.
- D — Full README feature list.

#### Q2 — How accounts get access

- ✅ **A — Email allowlist: admin adds an email; first OAuth login with it gets in. No admin UI at first.**
- B — Anyone signs in, account "pending" until admin activates it.
- C — One-time invite links.

#### Q3 — Auth library

Decided after a briefing: Auth.js is now part of Better Auth (security fixes only, new projects pointed to Better Auth); hand-rolled means owning every session/cookie/CSRF detail.

- ✅ **A — Better Auth.** Allowlist via `user.validateUserInfo` (checked on create and every sign-in); Drizzle adapter with `sqlite` provider on D1.
- B — Auth.js / NextAuth v5.
- C — Hand-rolled (Arctic + own sessions).

#### Q4 — Card ↔ set relation

- ✅ **A — Each card belongs to exactly one set.** A session can draw from several sets.
- B — Card can be in many sets.

#### Q5 — Card content format

- A — Plain text.
- ✅ **B — Markdown (bold, lists, code), no images.**
- C — Markdown + images.

#### Q6 — Data for future spaced repetition

- ✅ **A — Review log row per judgment (fail/hard to say/pass + timestamp), saved immediately.**
- B — Only per-card counters.
- C — Decide when spaced repetition is built.

#### Q7 — Interface languages at launch

- A — English only, i18n-ready.
- ✅ **B — English and Polish.**
- C — Polish only.

#### Q8 — Demo version

- ✅ **A — No login, predefined cards bundled in the app, nothing saved. Built as a later change.**
- B — Shared demo account in the DB.
- C — Skip demo for now.

### Round 2 — Auth details, data rules, sessions, delivery

#### Q9 — Linking Google and GitHub accounts with the same email

- ✅ **A — Auto-link only when both providers report the email as verified.**
- B — Never link; separate accounts.
- C — Manual linking from settings.

#### Q10 — Where the allowlist lives

- ✅ **A — Worker secret `ALLOWED_EMAILS` (comma-separated), changed with `wrangler secret put`.** Move to a D1 table after the admin UI exists: [mister-gnommer/fishcards#1](https://github.com/mister-gnommer/fishcards/issues/1) (deferred).
- B — D1 table edited via `wrangler d1 execute` / script.

#### Q11 — Removing a card

- ✅ **A — Hard delete after confirmation; its review log goes with it.**
- B — Soft delete into a restorable trash.
- C — Delete card, keep review log rows.

#### Q12 — Deleting a set that still has cards

- ✅ **A — Delete the set and its cards after a confirmation showing the card count.**
- B — Block until the set is empty.
- C — Move cards to an "Unsorted" set.

#### Q13 — Resuming an interrupted learning session

- ✅ **A — No resume; session lives in the page. Judgments are already saved one by one.**
- B — Resume in the same browser (`localStorage`).
- C — Resume on any device (server state).

#### Q14 — Card order in the MVP

- A — Random only.
- ✅ **B — Random, or ordered by creation date.** Spaced repetition is a later change.

#### Q15 — Session size

- A — All non-hidden cards in the chosen sets.
- ✅ **B — User also picks a limit (10 / 20 / 50 / all).**

#### Q16 — Remembering session preferences (sets, direction, order, size)

- ◐ **A — Saved in the account (D1).** User accepted either D1 or browser-only and left the call to Claude. D1 chosen because it is the end goal and costs little: one JSON text column on the Better Auth user (`user.additionalFields`), no extra table, and no later migration from `localStorage`.
- B — Browser only.
- C — Not remembered.

#### Q17 — How the interface language is chosen

- A — No locale in URL; user setting in D1, `Accept-Language` before login.
- ✅ **B — Locale in the URL (`/en/...`, `/pl/...`).** The public demo (Q8) makes shareable, language-specific URLs useful.

#### Q18 — UI building blocks for the MVP

- ✅ **A — Tailwind + shadcn/ui, plain functional look; dark-card design, flip animation and stacks in a later "look & feel" change.**
- B — Design up front.

#### Q19 — Environments and deploys

- ✅ **A — Production only + local dev on local D1; GitHub Actions on `main` runs tests, D1 migrations, deploy.**
- B — A + preview environment with its own D1.
- C — Manual `wrangler deploy`.

#### Q20 — Domain

- A — `*.workers.dev` for now.
- ✅ **B — `fishcards.gnommer.pl` from the start.** `gnommer.pl` DNS is already on Cloudflare, so a Workers custom domain works directly.

#### Q21 — Test strategy

- ✅ **A — Vitest for logic + Playwright for 2–3 core flows with a test-only login.**
- B — Vitest only.
- C — Playwright only.

#### Q22 — Package manager

- ✅ **A — npm.**
- B — pnpm.
- C — bun.

### Round 3 — MVP details and change split

#### Q23 — Test-only login for Playwright

- ✅ **A — Better Auth `test-utils` plugin, enabled only behind a test env flag; never in the production config.**
- B — Dev-only email/password login.
- C — Insert session rows into D1 from tests.

#### Q24 — Locale routing details

- ✅ **A — `/` redirects by cookie (last chosen language) → `Accept-Language` → `en`; the switcher sets the cookie.**
- B — `/` always goes to `/en`.

#### Q25 — Where hidden cards show up

- ✅ **A — In the set's card list, dimmed with a "hidden" badge behind a "show hidden" toggle; unhide there.**
- B — Separate "Hidden cards" page.

#### Q26 — Keyboard support in the MVP

- ✅ **A — Yes: Space flips, 1/2/3 mark fail/hard to say/pass.**
- B — Later, with look & feel.

#### Q27 — Rendering markdown safely

- ✅ **A — `react-markdown` with raw HTML off (default).**
- B — `marked` + DOMPurify.

#### Q28 — Field limits (server-side)

- ✅ **A — Term ≤ 200 chars, description ≤ 2,000, set name ≤ 100.**
- B — No limits.
- C — Other numbers.

#### Q29 — MVP split into OpenSpec changes

- ✅ **A — Four changes, in order: `bootstrap` → `auth` → `sets-and-cards` → `learning-session`.**
- B — Merge `bootstrap` and `auth`.
- C — Different split.

#### Q30 — `openspec/config.yaml` context

- ✅ **A — Use the drafted context and the proposal rule ("State what is out of scope") as is.**
- B — Edit it.

#### Q31 — Data visibility

- ◐ **All data is private to each user; no sharing in the MVP.** Stated as an assumption in round 3; the user accepted it with the round.
