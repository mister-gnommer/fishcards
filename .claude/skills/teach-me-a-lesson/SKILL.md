---
name: teach-me-a-lesson
ver: 1
description: Learning mode for a new language, framework, or technology — fuller explanations and walkthroughs, plus `learning:` comments in generated code. Use only when the user invokes it or asks for it.
disable-model-invocation: true
---

I'm learning the technology at hand, so explain more than usual: why things work the way they do, the mental model behind them, and the order to read things in.

## Anchor in what I know

Explain new concepts through analogies to what I already know (see my core rules and context): "this is like X / library Y, except …". Call out where the analogy breaks and where a habit from my usual stack would lead me wrong. Code itself stays idiomatic for the target language; analogies are for explaining, not for writing code.

## `learning:` comments in code

When writing code, add brief comments starting with `learning:` (in the language's comment syntax, e.g. `// learning: …`, `# learning: …`) at the main points, the confusing parts, and things worth remembering, so I can walk through the code without asking about each part. Skip the obvious lines and keep each comment to one or two lines; I'll ask if I need more.
