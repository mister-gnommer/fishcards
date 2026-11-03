---
name: polisher
ver: 1
description: Polish the wording of user-provided text at a chosen intensity level (1-5, default 2), optionally improving paragraph flow. Use only when directly invoked.
disable-model-invocation: true
---

# Polisher

Edit the text the user provides according to one polishing level.

## Arguments

- **Level**: a number 1-5 anywhere in the invocation (e.g. `/polisher 4 ...`). Default: **2**.
- **Flow**: the word `flow` in the invocation turns on flow improvement (see below). Off by default.
- **Text**: everything else. It may be inline text, a file path, or the current editor selection. If no text is given, ask for it.

## Levels

1. **Technical Correction**: fix objective errors and typos only (tense, conditionals, grammatically wrong phrasing). Preserve the original structure and tone. Keep edits minimal: make it correct, not different.
2. **Basic Cleanup**: correct errors and lightly smooth readability (punctuation, splitting run-on sentences, small reordering for clarity). Keep the user's voice unmistakably intact and stay close to the original.
3. **Moderate Enhancement**: improve flow and word choice in a noticeable but restrained way. Keep it natural and non-corporate. It should still sound like something a B2/C1 writer could produce with effort, not like a professional rewrite.
4. **Advanced Refinement (Aspirational Voice)**: make the message more confident and crisp while staying faithful to the user's voice. Reduce ambiguity and tighten phrasing. The result should read as the best version of the same person, not a different persona.
5. **Professional/Formal**: rewrite for a formal, public-facing context (website, announcement, external email). Minimize slang and casual phrasing and use precise wording.

## Flow improvement

Only when `flow` is on. These changes are optional: make them only where they improve readability. Use the entry matching the level:

1. Add paragraph breaks where they are clearly missing. Don't reorder sentences or otherwise restructure.
2. Lightly improve paragraph structure and add transitions between ideas. Keep reordering minimal.
3. Restructure paragraphs and reorder ideas for a clearer logical flow. Preserve all key points.
4. Optimize the reader's path: lead with the strongest point, group related ideas, give each paragraph a clear purpose. Restructure only where it clearly helps.
5. Reorganize freely for clarity and impact: lead with the core message, remove digressions, make the text flow from introduction to conclusion.

## Rules

- Never go beyond what the chosen level allows. Respect the user's voice.
- Don't change the language of the text.
- Replace en dashes, em dashes and similar characters with a plain hyphen `-`.
- Keep formatting (Markdown, code blocks, lists) intact. Don't edit code, commands or identifiers.

## Output

- Inline text: reply with the polished text only, with no explanations, comments or headings.
- File or selection: edit it in place, then reply with one short line saying it's done.
