---
name: diagrams
ver: 1
description: Draws diagrams (architecture, flows, sequences, data models) as PNG/SVG images with the D2 CLI. Use when the user asks for a diagram or a visual of a system or code structure.
---

# Diagrams

Write D2 source and render it with the `d2` CLI. If `d2` is missing, ask the user to install it (`sudo dnf install d2`, `brew install d2`); don't fetch it any other way.

1. Write `<name>.d2` where the user asked, otherwise in the project's `tmp/`.
2. Render: `d2 --sketch <name>.d2 <name>.svg && rsvg-convert -z 2 <name>.svg -o <name>.png` (hand-drawn look; drop `--sketch` if the user wants a clean one). Don't let `d2` write PNG directly: older versions download a headless browser for it.
3. Open the PNG and check it: overlaps, cut or unreadable labels, tangled arrows. Fix the source and re-render, up to 3 rounds; `--layout elk` often untangles dense graphs.
4. Keep the `.d2` next to the image so it can be edited later, and report both paths.
