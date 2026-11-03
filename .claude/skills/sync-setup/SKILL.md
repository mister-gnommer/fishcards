---
name: sync-setup
ver: 4
description: Syncs this machine's core rules wiring with the rules-of-engagement repo, updates all installed skills, and optionally installs the user's listed third-party skills and MCP servers. Use only when the user invokes /sync-setup.
disable-model-invocation: true
---

# sync-setup

Checks whether this machine matches the rules-of-engagement repo (`core/`, `skills/`, `bin/`, `lists/`) and fixes the differences the user approves. Work through the steps in order, then report.

Only change things the steps below cover. Before replacing or overwriting any file, show what's there (diff against the repo version) and back it up as `<file>.bak-<yyyyMMdd>`. Never commit or push. Ask first wherever a step says so.

## 1. Repo

Find the local clone (`$REPO` below), stopping at the first hit:

1. The current directory, if its `origin` remote is `mister-gnommer/rules-of-engagement`.
2. The target of an existing core symlink (`~/.claude/CLAUDE.md`, `~/.config/opencode/AGENTS.md`, `~/.codex/AGENTS.md`), up two levels.
3. The path in the `@` import of `~/.claude/CLAUDE.md`, up two levels.

If none of these works, ask the user where the clone is. Don't search the disk or clone it on your own.

- `git fetch`, then check `git status`.
- **Behind remote, clean tree** → `git pull --ff-only`.
- **Behind and dirty, or diverged** → stop and ask.
- **Unpushed commits or uncommitted changes** → note it for the report. `skills` installs from GitHub, so skill changes don't reach any machine (including this one) until they're pushed. Core changes reach this machine right away when it uses symlinks.
- **Skill folders with unpushed changes whose `ver` didn't change** → flag them (repo rule: one bump per commit).

## 2. Core rules and helper wiring

Check only tools that are installed (`command -v claude|opencode|codex`, or the config dir exists). Expected state:

| tool        | path                           | should be                                                                     |
| ----------- | ------------------------------ | ----------------------------------------------------------------------------- |
| Claude Code | `~/.claude/CLAUDE.md`          | symlink → `$REPO/core/claude.md`                                              |
| OpenCode    | `~/.config/opencode/AGENTS.md` | symlink → `$REPO/core/core.md`                                                |
| Codex       | `~/.codex/AGENTS.md`           | symlink → `$REPO/core/core.md`                                                |
| Codex       | `~/.codex/config.toml`         | `developer_instructions` = content of `$REPO/core/codex.md` (always a copy)   |
| all         | `~/.local/bin/mcp-headers`     | symlink → `$REPO/bin/mcp-headers` (only if `lists/mcps.md` has a `keyring`)   |

For each path:

- **Correct symlink** → nothing to do.
- **Symlink pointing elsewhere, or broken** → report where it points and ask what to do. It may be intentional.
- **Regular file (copy setup)** → diff it against the repo file. Ask whether to switch to a symlink (recommended) or refresh the copy. Some machines may need copies on purpose, e.g. synced or locked-down dirs.
- **Missing** → suggest creating the symlink. Create it only after the user approves.

Extra checks:

- **Claude `@` import:** `core/claude.md` starts with an absolute `@<path>/core/core.md`. If that path doesn't exist on this machine (different home dir or clone location), Claude silently loses all core rules. Report it and ask how to fix it. Don't edit the repo file on your own, since other machines rely on that path.
- **Codex `developer_instructions`:** if it differs from `core/codex.md`, show the diff and update just that key. Keep the rest of `config.toml` untouched, and use a TOML multi-line string (`"""…"""`).

## 3. Skills

Only update what's already installed. Never add or remove skills in this step.

The `skills` CLI must be a global install (`command -v skills`). Never fall back to `npx`: it runs the latest release, so a compromised publish would run unreviewed. If it's missing (new machine, or a new Node version under nvm), stop this step and ask the user to install a pinned version: `npm i -g skills@<ver> --before=<yyyy-MM-dd>`. Don't upgrade it on your own; if `npm view skills version` is newer than `skills --version`, mention it in the report.

1. `skills update -g -y` updates every installed skill, whatever its source.
2. Spot-check one changed skill: its `ver` in `~/.agents/skills/<name>/SKILL.md` should match the pushed repo version.
3. Compare the folders in `$REPO/skills/` with the lock-file entries (`~/.agents/.skill-lock.json`) whose `source` is `mister-gnommer/rules-of-engagement`. Note any mismatch for the report:
   - in the repo but not installed,
   - installed but gone from the repo.

## 4. Skills list

Skip this step silently if `$REPO/lists/skills.md` doesn't exist. It's the repo owner's personal list of third-party skills (`name | source` rows); skills from `$REPO/skills/` aren't on it.

Compare it with the installed skills (lock-file entries plus folders in `~/.agents/skills/`), leaving out skills from `$REPO/skills/`. Note for the report:

- on the list but not installed,
- installed but not on the list. Take the source from the lock file. If the skill isn't in the lock file (installed by hand), say so; the user has to provide its source,
- installed from a different source than the list says.

Don't install anything or edit the list in this step.

## 5. MCP servers list

Skip this step silently if `$REPO/lists/mcps.md` doesn't exist. Check only installed tools. Configs: Claude Code `~/.claude.json` (`mcpServers`), Codex `~/.codex/config.toml` (`[mcp_servers.*]`), OpenCode `~/.config/opencode/opencode.json` (`mcp`).

Note for the report, per tool:

- on the list but not configured,
- configured but not on the list,
- configured differently: another URL, or auth not wired as below,
- a token in plain text in any config, listed or not. Suggest moving it to the keyring and rotating it.

Install nothing in this step. Expected wiring, used when the report step installs or fixes a server (`<helper>` = absolute path of `~/.local/bin/mcp-headers`):

- **No `keyring`** → `add-mcp <url> -n <name> -g -y -a <agent>...`. `add-mcp` must be a global install, same rule as `skills`. Never pass a secret to it (`--header`): it writes it in plain text.
- **With `keyring`**:
  - Claude Code: `claude mcp add-json -s user <name> '{"type":"http","url":"<url>","headersHelper":"<helper> <keyring>"}'`.
  - Codex: a `[mcp_servers.<name>]` table with `url = "<url>"` and `http_headers_helper = "<helper> <keyring>"`. Leave the rest of the file untouched.
  - OpenCode: `"<name>": {"type": "remote", "url": "<url>", "enabled": true, "headers": {"Authorization": "Bearer {env:<env>}"}}` under `mcp`.

Before wiring a keyring server, run `<helper> <keyring> >/dev/null` (never let the token reach the output). If it fails, the token isn't stored yet. Guide the user, and never ask them to paste a token into the chat:

1. Get the token from the provider. If it was ever in plain text (config, chat, repo), rotate it.
2. The user stores it with a command that prompts for the value: `secret-tool store --label="<name> MCP" service <keyring>` (Linux) or `security add-generic-password -a "$USER" -s <keyring> -w` (macOS).
3. Re-run the check.

OpenCode can't run a helper, so it needs `<env>` set. Propose an `opencode()` wrapper in the shell rc that sets each listed `<env>` from the keyring, extending an existing wrapper if there is one, and add it only after the user approves:

```sh
opencode() {
  CONTEXT7_API_KEY=$(secret-tool lookup service context7) \
    command opencode "$@"
}
```

On macOS use `security find-generic-password -s <keyring> -w`. Tell the user it only works when OpenCode is started from a terminal.

## 6. Report

Keep it short. Include:

- a table of what was checked, what changed, and what was left as-is (and why),
- anything waiting on the user: unpushed changes, questions you skipped,
- skill mismatches from step 3. Once everything else is done, ask whether to install the missing ones (`skills add mister-gnommer/rules-of-engagement -g -y -s <names...> -a <agents...>`, with agents taken from `lastSelectedAgents` in the lock file) or remove the stale ones (`skills remove -g -y -s <names...>`). Default: leave them as they are.
- skills list differences from step 4. Once everything else is done, ask:
  - whether to install the missing ones: one `skills add <source> -g -y -s <names...> -a <agents...>` per source, agents as above. Default: skip, since not every machine needs every skill.
  - whether to add the unlisted ones to `$REPO/lists/skills.md`. If yes, add the rows (keep the table sorted) and leave the change uncommitted; mention it needs a commit and push.
- MCP differences from step 5, plain-text tokens first. Once everything else is done, ask per server whether to install or fix it, wired as step 5 says, and whether to add unlisted ones to `$REPO/lists/mcps.md` (same rules as the skills list). Default: skip.
- reload notes:
  - Claude Code picks up rules on a new session or `/compact`, and skills on a new session.
  - OpenCode picks up rules on the next request, and skills on restart.
  - Codex picks up both on a new session.
  - MCP changes need a new session (OpenCode: restart).
