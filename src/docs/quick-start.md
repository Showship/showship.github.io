---
title: Quick start
description: Collect a repo, answer one question, build the deck. The workflow, the reporting periods and the report folder, step by step.
seoTitle: Quick start: make your first progress report
---

## Make your first report

Open your agent inside a repo you worked in this period.

```bash
cd ~/code/clinicbook-api
claude            # or: codex, antigravity
```

Then say:

```text
Collect this week's commits and PRs for Showship
```

On first use the agent creates `config.json` and asks for anything the installer did not set: your role, audience, reporting period, company, logo, presenter name, where to store reports and who is who. Then it collects the repo, writes a draft and shows you what it found. Repeat in each repo that had work in the period, then:

```text
Build the report
```

The agent merges the drafts, asks one consolidated question (progress percentages, blockers outside GitHub, non-code work), runs the jargon check and writes the `.pptx` into the report folder.

You can talk to it in any language. The deck is written in your configured `deckLanguage`.

## The four steps

| Step | You say | The agent does |
| --- | --- | --- |
| 1 | "Collect this week's commits and PRs for the report" (in each repo) | Runs `collect_commits.sh` and `collect_prs.sh`, analyzes PRs and reviews, writes `<report>/<repo>.md`, shows a summary and questions |
| 2 | Answers and extra info ("Phase 3 is at 40%", "waiting on the SMS provider") | Records it in `<report>/notes.md` |
| 3 | "Build the report" | Plans slides, writes `report.json`, runs the jargon check, builds and visually checks the deck |
| 4 | "Change the title on slide 4", "add a decision about X" | Edits `report.json` and rebuilds |

Standing instructions (people to exclude, how to count progress, environments) can go in `notes.md`. The agent re-reads the previous report's notes.

## Reporting periods

`period` in config sets the default rhythm. You can override it in any request: "last two weeks", "September", "Oct 1 to Oct 9", "sprint 14".

| `period` | Default range when there is no earlier report | Deck title | "Next" slide |
| --- | --- | --- | --- |
| `weekly` (default) | Last 7 days | Weekly Development Progress Report | Next Week's Plan |
| `biweekly` | Last 14 days | Biweekly Development Progress Report | Next Two Weeks |
| `sprint` | Last `sprintDays` days (default 14). The agent asks the sprint number once. | Sprint N Progress Report | Next Sprint's Plan |
| `monthly` | The current calendar month to date, or the previous month if the report is made in its first 5 days | Monthly Development Progress Report | Next Month's Plan |
| `custom` | The agent asks you for the dates | Development Progress Report | Next Steps |

When an earlier report exists, the range starts the day after the newest report folder's date. Whatever range you name in chat wins.

## Collect and build are separate

The set of repos changes from period to period, so the work is split per repo:

1. **Collect** runs inside one repo. It reads the period's commits and pull requests (descriptions, reviews, replies, comments) and writes an analyzed, business-language draft for that repo into the report folder.
2. **Build** runs anywhere. It merges every draft plus your notes, asks for anything missing, checks the language, and produces the deck.

If you just say "make this week's report" inside a repo, the agent collects that repo and then asks whether other repos should be collected before building.

## The report folder

Everything for one report lives in `<reportsDir>/<YYYY-MM-DD>/`, named for the report date.

| File | What it is |
| --- | --- |
| `<repo>.md` | The analyzed draft for one repo |
| `raw/<repo>-commits.md`, `raw/<repo>-prs.md` | Raw collector output |
| `tasks.md`, `tasks.json` | The period's task digest from your tracker (one per report) |
| `notes.md` | Your own additions and standing instructions |
| `report.json` | The deck spec. This is the source of truth for the deck. |
| `<Period>_Progress_Report_<date>.pptx` | The output, for example `Sprint_14_Progress_Report_2026-10-09.pptx` |

## What the agent asks you

Showship never invents numbers, owners, dates or blockers. When it cannot tell, it asks once, in your language: percentages to confirm, non-code work such as paperwork or approvals, blockers outside GitHub, and names it cannot map. If something stays unknown, the slide states the status in words.

## Next

- [Usage examples]({{docs}}examples/) for common requests.
- [Configuration]({{docs}}configuration/) for every `config.json` key.
