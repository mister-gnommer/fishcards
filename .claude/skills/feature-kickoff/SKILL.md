---
name: feature-kickoff
ver: 1
description: Before starting a new feature in an existing project, scans the backlog (TODO/README files, code comments, GitHub issues) for items worth bundling and recalls the project's working conventions. Use when the user asks to start building a new feature or larger change in an existing repo. Skip for bug fixes, small tweaks, questions, new projects, and features already underway.
---

# Feature kickoff

Run once, before planning or editing. Read-only until the user answers: no edits, branches, or issue comments. Keep the report under ~15 lines.

## 1. Backlog

Gather open items from:
- `TODO*`, `ROADMAP*`, `BACKLOG*`, and TODO/roadmap sections in the README.
- `git grep -nwE 'TODO|FIXME'` (tracked files only). If it returns more than ~100 hits, group them by file or directory instead of reading each one.
- `gh issue list --state open --limit 50 --json number,title,labels`. If `gh` is missing, unauthenticated, or there's no GitHub remote, skip it and say so in one line.

Propose at most 3 items that fit: same files or components, or cheap given the feature's changes (e.g. a page redesign plus the pending favicon). For each: source (file or `#123`), why it fits, rough size. Leave out anything that pulls in unrelated areas. If nothing fits, say so in one line.

## 2. Conventions

Check in order, stop once clear:
- Rule files already in context (AGENTS.md, CLAUDE.md): don't re-read, pick what's relevant.
- Process frameworks and docs, e.g. OpenSpec (`openspec/`), Spec Kit (`.specify/`, `specs/`), BMAD, ADRs, `CONTRIBUTING.md`, PR templates. The list isn't exhaustive: treat any spec or process folder as a signal.
- Commit rules: commitlint/husky/lefthook config, CI checks on PR titles.
- Nothing found: `git log --oneline -20` and `git branch -a` for commit style (conventional, scopes, issue refs) and flow (feature branches and PRs, or direct to main).

Remind the user in 1–2 sentences, covering only conventions that affect this feature (e.g. "Uses OpenSpec: start with a change proposal. Conventional commits with scope, one PR per feature.").

## 3. Branch

Ask about a new branch only if on the default branch and the project uses feature branches (per its rules or history). Suggest a name that matches existing branch names.

## Output

One message with the backlog proposals, conventions reminder, and branch question. If there's a question, wait for the answer before starting; otherwise give the reminder and proceed.
