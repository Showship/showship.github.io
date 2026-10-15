---
title: Configuration
description: Every config.json key explained: role, audience, reporting period, branding, people, projects, task tracker and exclusions.
seoTitle: config.json reference
---

`config.json` lives in the skill folder (`<skills folder>/showship/config.json`). The agent creates it on first run from `config.example.json`, and the installer fills in the answers you gave. It is git-ignored and never shipped.

## A complete example

```jsonc
{
  "role": "lead",                   // lead = whole team, member = your own work
  "audience": "business",           // business = plain language, engineering = technical OK
  "period": "sprint",               // weekly | biweekly | sprint | monthly | custom
  "sprintDays": 14,                 // sprint length (period "sprint")
  "company": "Acme Digital Co., Ltd.",
  "presenter": "Maya Lin @Maya",    // title slide
  "closingPresenter": "Maya Lin",   // closing slide
  "logo": "~/Pictures/acme-logo.png", // SVG/PNG/JPG; borders trimmed automatically; false = none
  "style": "corporate",             // showship | paper | ember | summit | classic | modern | corporate | vivid
  "updateCheck": true,              // true = tell me once per session when a newer Showship exists
  "theme": {
    "dark": "141412",
    "accent": "A8CC3A",
    "accentLight": "D6E6A0",
    "warning": "E0A33A"
  },
  "deckLanguage": "English",
  "reportsDir": "~/Showship",

  "leadLogins": ["maya-lin", "Maya Lin"],  // YOUR git name(s) and GitHub login
  "team": {
    "Leo Park": "Leo Park @Leo",
    "leo-park": "Leo Park @Leo",
    "nina-dev": "Nina Rao @Nina",
    "maya-lin": "Maya Lin @Maya"
  },
  "projects": {
    "clinicbook-api": "Booking Service - ClinicBook",
    "pulseboard-web": "Web App - PulseBoard"
  },
  "tasks": {
    "provider": "jira",
    "jira": { "baseUrl": "https://acme.atlassian.net", "projects": ["CLINIC"] }
  },
  "taskUsers": { "nina@acme.io": "Nina Rao @Nina" },
  "exclude": { "people": ["former-member", "ou_yyyy"] }
}
```

## Key reference

| Key | Meaning |
| --- | --- |
| `role` | `lead` reports the whole team: everyone's commits, PRs and tasks, with the lead's reviews as the most authoritative source. `member` reports only your own work. |
| `audience` | `business` writes for the least technical person in the room. `engineering` keeps technical terms, but every item still states the outcome. |
| `period`, `sprintDays` | The default reporting rhythm and the sprint length. See [Reporting periods]({{docs}}quick-start/#reporting-periods). |
| `company`, `presenter`, `closingPresenter` | Shown on the title and closing slides. |
| `logo` | Path to your logo (SVG, PNG or JPG, `~` allowed). Borders are trimmed automatically. `false` means none. SVG is rendered at high resolution, so prefer it. Default: the Showship mark. |
| `style` | The deck design. See [Deck designs]({{docs}}deck-styles/). Can be overridden per report in `report.json`. |
| `theme` | Optional hex colours (`dark`, `accent`, `accentLight`, `warning`) that override the style's palette. |
| `deckLanguage` | Language of the slides. Default `English`. Drafts, notes and `report.json` use it too. |
| `reportsDir` | Where report folders live. `~` allowed. Default `~/Showship`. |
| `leadLogins` | Your own git author names and GitHub logins. In `lead` mode your comments are tagged `(LEAD)`. In `member` mode they also select which commits, PRs and tasks are yours. |
| `team` | Maps both git author names and GitHub logins to display names. The agent asks once when it meets an unmapped name. |
| `projects` | Maps local repo folder names to project or service names. On slides, projects are grouped by product and track, not by repo. |
| `tasks` | Your task tool and its settings. See [Task trackers]({{docs}}task-trackers/). |
| `taskUsers` | Maps tracker user ids, emails or names to display names. |
| `exclude.people` | People left out of every count and slide: tracker ids, names, emails, git author names or GitHub logins. |
| `updateCheck` | `true` (default) lets the agent tell you once per session when a newer release exists. `false` turns it off. |
| `signature` | `false` hides the small "Shipped with Showship" mark in the Showship style. Can also be set per report. |

## Tips

- **Reporting period.** The range starts the day after your previous report (the newest folder in `reportsDir`). With no earlier report it uses the period's default: 7 days, 14 days, `sprintDays`, or the calendar month. A range you name in chat wins.
- **Git name versus GitHub login.** `git config user.name` ("Maya Lin") is just a label on commits. PRs and comments use the GitHub login ("maya-lin"). Map both. Find them with the commands below.
- **Project names** are per repo or service. The agent groups them by product and track on slides, for example "ClinicBook · Clinic Dashboard".
- **Unknown names.** The agent asks once and adds them.

```bash
git log --format='%an' | sort -u
gh pr list --state all --limit 50 --json author --jq '.[].author.login' | sort -u
```

## Roles and audiences

`role: member` presents in the first person plural or a neutral voice ("Delivered...", "In progress..."), never as a ranking against others. Reviews you received explain status and fixes, and reviews you gave count as your contribution. The `tracker` and `activity` slides are team views, so they are skipped in `member` mode unless you ask for them.

`audience: engineering` still never puts code, file paths or raw review comments on slides.
