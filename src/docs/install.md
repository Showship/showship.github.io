---
title: Install
description: Run npx showship, choose your agent, role and deck design, install without prompts, and keep Showship up to date.
seoTitle: Install Showship with npx
---

Use `npx`, not `npm i`. Showship is not a library you import: `npx showship` runs the installer, which copies the skill into your agent's skills folder (`~/.claude/skills/showship` for Claude Code). Prefer a global command? Run `npm i -g showship`, then `showship`.

```bash
npx showship
```

## The installer's questions

Use the up and down arrows to choose, Enter to confirm, and the left arrow or Esc to go back a step and change an earlier answer.

| Question | Choices |
| --- | --- |
| Which agent do you want to install for? | Claude Code, Codex (experimental), Antigravity, Other agents (experimental) |
| Where do you want to install it? | Global (all projects) or This project (this folder only) |
| How will you use it? | Team lead (the whole team's work) or Individual (your own work) |
| Who will read the report? | Business (plain language) or Engineering (technical terms are fine) |
| How often do you report? | Weekly (default), Biweekly, Sprint (length set by `sprintDays`, default 14), Monthly, or Custom |
| Which task tool does your team use? | None, Lark, Jira Cloud, Linear, Asana, ClickUp, or Custom (MCP) |
| Which deck design do you want? | Classic, Modern, Corporate, Vivid, Showship, Paper, Ember or Summit. See [Deck designs]({{docs}}deck-styles/) |

Then it copies the skill, records your choices in `config.json` (keeping anything already there), installs the deck builder's dependencies, checks for `git`, `gh` and LibreOffice, and prints the setup steps for the tracker you picked.

## Where the skill goes

| Agent | Global folder | Project folder |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/showship` | `./.claude/skills/showship` |
| Codex (experimental) | `~/.codex/skills/showship` | `./.agents/skills/showship` |
| Antigravity | `~/.gemini/config/skills/showship` | `./.agents/skills/showship` |
| Other agents (experimental) | `~/.agents/skills/showship` | `./.agents/skills/showship` |

## Install without prompts

For CI, scripts, or when you already know what you want:

```bash
npx showship --yes                                   # Claude Code, global, weekly
npx showship --agent codex --project                 # Codex, this project
npx showship --yes --period sprint --tasks jira --style corporate
```

| Option | Effect |
| --- | --- |
| `--agent <id>` | `claude`, `codex`, `antigravity` or `agents` |
| `--global` / `--project` | Install for your user, or for the current project only |
| `--period <p>` | `weekly`, `biweekly`, `sprint`, `monthly`, `custom` |
| `--tasks <tool>` | Task tracker: `none`, `lark`, `jira`, `linear`, `asana`, `clickup`, `mcp` |
| `--mcp-server <name>` | With `--tasks mcp`: the MCP server to read tasks from. Also `--mcp-name`, `--mcp-lists "A, B"` and `--mcp-instructions "..."` |
| `--style <name>` | Deck design: `showship`, `paper`, `ember`, `summit`, `classic`, `modern`, `corporate`, `vivid` |
| `--role <role>` | `lead` (whole team) or `member` (your own work) |
| `--audience <a>` | `business` (plain language) or `engineering` |
| `--dir <path>` | Install into a custom skill folder |
| `-y`, `--yes` | Do not ask: use defaults for anything not given |
| `--skip-deps` | Skip `npm install` for the deck builder |
| `--uninstall` | Remove the skill (backs up `config.json` first) |

## Updating

Run the installer again with `@latest`. Without it, `npx` may reuse an older copy from its cache.

```bash
npx showship@latest                # asks again, with your current answers pre-selected
npx showship@latest --yes          # no questions: update the files, keep every setting (Claude Code, global)
npx showship@latest --yes --agent codex      # same for another agent: codex, antigravity or agents
npx showship@latest --yes --project          # installed into a project? run this inside that project
```

Your `config.json` (company, logo, team, tracker, style) and `node_modules` are kept. Only the skill files are replaced, and the previous ones are backed up to `~/.showship/backups/<timestamp>/`. Restart your agent afterwards, because skills are loaded when a session starts. The installer prints the version it installs, and `npm view showship version` shows the newest one.

### You are told when there is an update

The skill records the version it was installed with (a `VERSION` file in the skill folder). At the start of a session the agent looks up the newest release on npm (one request, only the package name is sent) and, if yours is older, tells you the exact command to run, such as `npx showship@<version> --yes`. You can ignore it and carry on. It is shown again next session until you update. Set `"updateCheck": false` in `config.json` to turn it off.

Installs made before this feature (up to `0.1.0-beta.10`) have no `VERSION` file, so they only start checking after one manual update.

To try the latest code on GitHub before it reaches npm, run `npx github:Soe-Moe/showship`.

## Manual install

```bash
git clone https://github.com/Soe-Moe/showship.git
cp -r showship/skill ~/.claude/skills/showship        # or your agent's skills folder
cd ~/.claude/skills/showship/scripts && npm install
```

## Uninstall

```bash
npx showship --uninstall
```

`config.json` is backed up before the skill is removed.
