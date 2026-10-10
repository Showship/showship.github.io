---
title: Troubleshooting
description: Fixes for missing PR data, missing commits, untagged reviews, raw logins on slides, tracker errors, fonts and sharp.
seoTitle: Troubleshooting Showship
---

| Problem | Fix |
| --- | --- |
| "PR data skipped" | Install `gh` and run `gh auth login`. Check that `gh pr list` works inside the repo. |
| Teammates' commits are missing | They need to push their branches. The collector reads all remote branches after `git fetch --all`. |
| Your review comments are not tagged `(LEAD)` | Add your GitHub login to `leadLogins`. |
| A name shows as a raw login | Add it to `team` (git and GitHub names) or `taskUsers` (tracker names). |
| "Task digest: Not collected" | The digest says what is missing: a token in your environment, or `tasks.<tool>` settings in `config.json`. |
| Jira returns HTTP 401 or 403 | Check that `JIRA_EMAIL` matches the token's account and that you can see the projects in the browser. |
| The agent does not pick up the skill (Codex or Antigravity) | Check the folder in the [install table]({{docs}}install/#where-the-skill-goes), restart the agent, and ask it "what skills are available?". Then [open an issue]({{issues}}). |
| `npm audit` warning about `image-size` | The package pins a patched version through `overrides`. Delete `node_modules` and `package-lock.json` in `scripts/` and run `npm install` again. |
| Fonts look different | See the [font table]({{docs}}deck-styles/#fonts). Install the fonts your design needs, or PowerPoint substitutes them. |
| `sharp` fails to install | Run `cd <skills folder>/showship/scripts && npm rebuild sharp`. |
| The layout check says it could not render | Install LibreOffice and poppler (`brew install --cask libreoffice`, `brew install poppler`), and install the deck's fonts. |
| The agent does not mention an update, or you want it to stop | `updateCheck` in `config.json` controls it. Installs up to `0.1.0-beta.10` have no `VERSION` file and need one manual update first. |

## Still stuck

[Open an issue]({{issues}}) with what you ran, what you expected and what happened. Showship is in beta, and reports from Codex and Antigravity users are especially useful.
