---
name: writing-ts
ver: 2
description: TypeScript code style rules. Use whenever creating or editing TypeScript code (.ts, .tsx, .mts, .cts files).
---

# Writing TypeScript

## Built-ins
Prefer language/runtime built-ins over hand-rolled equivalents (e.g. `for await` over manual stream readers).

Write for the project's configured runtime and lib target. Don't hand-roll workarounds for features the target lacks — say so instead.

## Braces
Always use braces `{}` for `if` statements, even single-line ones. Never write braceless `if`.

## Object.assign
Avoid `Object.assign()`. If it truly cannot be avoided, add a comment explaining why it is safe.

## JSDoc
Document every function with JSDoc; only trivial one-liners may be skipped. The goal is not to restate types (TypeScript already has them) but to make the function's intent and behavior obvious to someone reading or calling it.

- **Description**: one or two sentences. Go longer only when the function is genuinely tricky.
- **`@param`**: name and a short description. Don't restate the TS type and don't describe object shapes.
- **`@returns`**: same as params. Skip it when the name makes the result obvious (e.g. boolean `is…()`, `has…()`).
- Don't use `@throws`, `@example` or other advanced tags.

Example:

```ts
/**
 * Merges user settings over defaults, dropping keys the schema no longer knows.
 * @param settings raw settings loaded from disk
 * @returns settings safe to pass to the app
 */
function normalizeSettings(settings: RawSettings): Settings {
```

### Backfilling docs
Write JSDoc only for functions you add or edit. Don't document untouched functions on your own; if a file you're working in has undocumented functions, ask once per task whether to backfill them.
