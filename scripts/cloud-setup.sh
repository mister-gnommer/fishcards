#!/bin/bash
# Cloud sessions don't have the CLIs that local skills/rules rely on; install them there only.
[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0

# OpenSpec version must match the `generatedBy` of the openspec-* skills in .claude/skills.
command -v openspec >/dev/null || npm install -g @fission-ai/openspec@1.14.1
command -v ctx7 >/dev/null || npm install -g ctx7@0.9.0
exit 0
