# Fishcards

"Fiszka" (/ˈfiʂ.ka/) in Polish is the name of a two-sided card people use to learn terms and definitions - a flashcard. Since it's pronounced almost exactly like "FISH-kah," it became the name for a project that helps organize knowledge and learn new things.

> [!NOTE]
> I'm a software engineer. It feels wrong to me not to read every line of code I own. But I'm also a creator, and it feels just as wrong to miss out on all the cool things I could build in a given time.
> With this project, I'm trying to realign how I work: let go of a bit more control and focus more on the project than on exactly how it's built.
> What I mean is: this is mostly vibe-coded. I take responsibility for the important parts (auth and safety). For the rest, you can blame AI XD

## about Fishcards

This is a learning helper. You learn from flashcards that you can create yourself or ask an agent to create for you. You can organize cards into sets. One side of a card has a term, the other has a description, and during a learning session you can decide whether to start from the former or the latter (or randomly).

## features

- user account and cloud storage of cards and settings
- multilang: choose the interface language you prefer
- add, edit, hide and remove cards
- ask AI to create cards for you and review what it proposed
- learning session:
    - choose cards sets and preferences (term -> description, description -> term, or both randomly)
    - go through cards - you decide when to reveal the other side and can mark how well you did (fail/hard to say/pass)
    - after the session you see a summary and can choose to manually hide cards from future sessions
- stats show how well you're doing and what needs more work - use them to start a new session or ask the agent to generate new cards
- cards selection:
    - random
    - ordered
    - spaced repetition mode (algorithm TBD)
- AI built in: the user doesn't have to provide a key or configure anything (the application uses my OpenAI API key and Sol on medium thinking)
- demo version: use a simple predefined set of cards to see the application in action
- keyboard support for flipping and judging
- mobile first, but desktop friendly for ease of editing cards
- export and import cards and settings in single json

## AI support built in

- create a set of new cards using a short prompt
- add cards to a set using a prompt (existing cards get attached to prevent duplicates); optionally attach stats info so the agent generates cards in areas you struggle with
- AI is one-shot: you cannot chat with it, only provide a new, better prompt if you don't like the previous cards


## dev notes

### stack

- Next.js (App Router)
- OpenSpec for SDD
- Better Auth with OAuth (Google and GitHub); same verified email on both providers = one account
- no open sign-up: only emails on an admin-managed allowlist can sign in
- Cloudflare Workers with the OpenNext adapter + D1 and Drizzle, served at `fishcards.gnommer.pl`
- next-intl, locale in the URL (`/en`, `/pl`)
- Tailwind + shadcn/ui
- Vitest + Playwright; GitHub Actions on `main` runs tests, D1 migrations and deploy
- a set of prompts with structured output; in some cases the user can optionally add their own prompt

### MVP

Built as four OpenSpec changes, in order: `bootstrap` → `auth` → `sets-and-cards` → `learning-session`. Stats, AI, spaced repetition, import/export, the demo and the final look come after. Every judgment is logged from day one, so stats and spaced repetition can use the full history later.

### design

Not sure about colors yet - TBD. The MVP uses a plain functional look; the look described here comes in a later change. Cards are portrayed as real, horizontal cards (they don't have to be in playing card format). They are dark, with `fishcards-logo.svg` behind the text (the logo can be toned down to keep the text readable). The background will probably be a stock photo (concrete? tabletop?). Card flipping is animated, and answered cards land in three stacks depending on the user's declaration: pass/fail/hard to say (the stacks feature can be deferred).

### decisions

Planning decisions and the reasons behind them: [docs/grilling-ledger.md](docs/grilling-ledger.md).
