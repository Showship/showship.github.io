---
title: Slide templates
description: The report.json fields and the twelve slide templates, from dashboard and timeline to tracker and table, with character limits.
seoTitle: Slide templates and report.json fields
---

A full working example lives in `examples/report.example.json` in the repository. The machine-readable definition of everything on this page is `references/report.schema.json` (JSON Schema): field names, types, allowed values, item counts and character limits. `lint_report.js` validates `report.json` against it, and editors that understand JSON Schema use it for autocomplete when the file starts with `"$schema": "<path to report.schema.json>"`. If this page and the schema disagree, the schema wins.

## report.json

```jsonc
{
  "date": "October 2, 2026",                  // shown on title and closing slides
  "presenter": "Maya Lin @Maya",              // title slide
  "closingPresenter": "Maya Lin",             // closing slide
  "company": "Acme Digital Co., Ltd.",        // optional (default from config)
  "eyebrow": "Progress report",               // optional
  "period": "sprint",                         // optional: weekly | biweekly | sprint | monthly | custom
  "sprint": 14,                               // optional: sprint number, gives "Sprint 14 Progress Report"
  "title": "Weekly Development\nProgress Report", // optional: overrides the period's default title
  "style": "corporate",                       // optional: showship | paper | classic | modern | corporate | vivid
  "slides": [ /* content slides, in order; title and closing slides are added automatically */ ]
}
```

Every content slide has `type`, `eyebrow` (a short label, shown in sentence case) and `title` (one line).

**States** used across templates: `done` (accent colour), `progress` (light accent), `blocked` (warning colour) and `next` (grey, not started). Colours depend on the design.

**Icons** are Lucide names without the `Lu` prefix, in PascalCase: `Database`, `Smartphone`, `FileText`, `Users`, `UserRound`, `Briefcase`, `RefreshCw`, `ShieldCheck`, `TrendingUp`, `Code`, `FlaskConical`, `Rocket`, `Target`, `ListChecks`, `Workflow`, `Component`, `Landmark`, `CalendarClock`, `Headset`, `LayoutDashboard`, `CircleCheckBig`, and any other name from `react-icons/lu`.

### How designs render the same JSON

`classic` renders it with its own editorial layouts (for example `rings` as large figures, `phase_bars` as phase lists, `timeline` vertically). `showship` has its own signature layouts (colour per project, gauges, pill tracks, a milestone trail). `paper` has its own printed-report layouts (ruled lists, big figures, a single trail line for timelines; `rows` ignores `illustration`). `modern`, `corporate` and `vivid` share the card layouts.

### Length limits

Limits are in characters. They are defined as `maxLength` in the schema and enforced by `lint_report.js`, so text that is too long fails before the build.

| Field | Limit |
| --- | --- |
| Slide title | 62 |
| Eyebrow | 48 |
| Dashboard card label, headline, description | 34, 40, 110 |
| Key update, impact | 150 |
| Timeline step title, tag, description | 28, 16, 90 |
| Phase name | 45 |
| Table focus | 130 |
| Review finding text | 140 |
| Attention title, text | 80, 170 |
| Tracker item, focus | 55, 110 |

## `dashboard`

Executive summary KPI cards. Use as slide 2, with 2 to 4 cards, one per project.

```json
{ "type": "dashboard", "eyebrow": "Executive Summary", "title": "This Week at a Glance",
  "cards": [
    { "label": "App Store Release", "metric": "100%", "state": "done", "status": "COMPLETED",
      "headline": "Developer Account Verified", "desc": "One sentence, up to 110 chars." }
  ],
  "keyUpdate": "Optional one-line highlight shown in a dark strip at the bottom." }
```

`metric` can be a percentage, a fraction ("1 / 2"), a count ("3") or a word ("Live").

## `timeline`

Milestones, or a resolved blocker. 3 to 5 steps across the slide.

```json
{ "type": "timeline", "eyebrow": "...", "title": "...",
  "badge": { "text": "BLOCKER RESOLVED", "state": "done" },
  "steps": [ { "tag": "Last week", "title": "Blocked", "state": "blocked", "desc": "up to 90 chars" } ],
  "impact": "Optional business-impact line." }
```

## `rings`

Doughnut progress charts: 2 to 3 doughnuts (set `"dark": true` on the overall one) plus optional status tiles.

```json
{ "type": "rings", "eyebrow": "...", "title": "...",
  "rings": [ { "label": "Combined Progress", "sub": "8 phases", "pct": 64, "dark": true } ],
  "stats": [ { "value": 4, "label": "Phases Completed", "state": "done" } ],
  "footnote": "Progress = average completion across each track's phases." }
```

## `phase_bars`

Phase-level bar charts: 1 to 2 tracks, about 3 to 6 phases each. A `pct` of 100 is a completed bar, 1 to 99 is an in-progress bar, and 0 is an empty bar labelled "(Not started)". Keep phase names to 45 characters.

```json
{ "type": "phase_bars", "eyebrow": "...", "title": "...",
  "tracks": [ { "title": "Core Product Track", "owner": "Leo Park @Leo",
    "phases": [ { "name": "P1 · Database Architecture & Backend", "pct": 100 } ],
    "note": "Optional one-line italic note." } ] }
```

## `workstreams`

A finished item plus a process flow. On the left, a dark hero card with a big metric. On the right, 3 to 5 chevron steps.

```json
{ "type": "workstreams", "eyebrow": "...", "title": "...",
  "hero": { "label": "Workstream 1", "title": "Data Transfer to New System", "metric": "100%", "state": "done", "desc": "up to 160 chars" },
  "flow": { "label": "Workstream 2", "title": "Usage Tracking Rollout", "state": "progress",
    "steps": [ { "title": "Event Plan Agreed", "desc": "up to 50 chars", "state": "done" } ],
    "next": "Optional next-step line." } }
```

## `rows`

Icon rows with an optional visual: 2 to 4 rows. Without a visual the rows use the full width. Add either `image` (a path to a screenshot, relative to `report.json`) or `illustration` (a generated hub-and-spoke graphic: one center icon and 2 to 4 node icons).

`desc` is a string, or an array for sub-bullets: strings are plain lines, and `{ "label", "text" }` objects become **Label:** text.

```json
{ "type": "rows", "eyebrow": "...", "title": "...",
  "illustration": { "center": "Briefcase", "nodes": ["Smartphone", "RefreshCw"] },
  "rows": [
    { "icon": "Briefcase", "header": "Project Takeover", "desc": "..." },
    { "icon": "Users", "header": "Delegation", "desc": [
      "Modules assigned to developers:",
      { "label": "Core Product", "text": "Leo Park @Leo" } ] },
    { "icon": "TrendingUp", "header": "Business Impact", "desc": "..." }
  ] }
```

## `gallery`

A screenshot strip: 2 to 7 screenshots of the same aspect ratio, with step labels.

```json
{ "type": "gallery", "eyebrow": "...", "title": "...",
  "images": ["shots/1.png", "shots/2.png"], "labels": ["Search", "Result"] }
```

## `activity`

Team delivery activity from GitHub. A clustered column chart per person (2 to 6 people, 2 to 4 series) plus up to 4 KPI tiles on the right, the first highlighted. Use counts from the collected drafts only, and never as a ranking.

```json
{ "type": "activity", "eyebrow": "Engineering Activity · GitHub", "title": "Team Delivery Activity This Week",
  "series": ["Commits", "PRs Opened", "PRs Merged", "Reviews Given"],
  "people": [ { "name": "Leo Park @Leo", "values": [18, 1, 2, 0] } ],
  "kpis": [ { "value": "3", "label": "PRs merged to develop" }, { "value": "2", "label": "PRs in review" } ],
  "note": "Source: GitHub commits, pull requests and reviews, Sep 26 - Oct 2." }
```

## `review_insights`

Code review outcomes. On the left, a dark column with 2 to 4 stats. On the right, 3 to 5 findings, each with a quality-area tag, one business-language sentence and a status pill: `done` shows RESOLVED, `progress` IN PROGRESS, `blocked` OPEN RISK and `next` PLANNED (override with `status`). Use it for issues caught in review, decisions and open risks, never for raw code comments or names attached to problems.

```json
{ "type": "review_insights", "eyebrow": "Quality & Code Review · ClinicBook",
  "title": "Code Review: Quality Gates Held Before Release",
  "stats": [ { "value": "4", "label": "PRs reviewed by the lead" }, { "value": "2", "label": "Rework requests, both resolved" } ],
  "findings": [
    { "area": "Performance", "text": "A database query inefficiency was caught in review and fixed before merge.", "state": "done" },
    { "area": "Scope Decision", "text": "Clinic logo upload moved to Phase 3 (Reports & Exports).", "state": "next" }
  ],
  "note": "Source: GitHub PR reviews and comments, Sep 26 - Oct 2." }
```

## `attention`

Blockers and decisions needed. Two columns: Blockers and Risks, and Decisions Needed. 0 to 4 items each. An empty column shows a "none this week" line. Cards size to content. `meta` is a small italic line for owner, expected date or options.

```json
{ "type": "attention", "eyebrow": "Needs Attention", "title": "Blockers & Decisions Needed",
  "blockers": [ { "title": "Reminders release waiting on one fix",
    "text": "Duplicate reminders must be prevented before release. Fix is small and already tested.",
    "meta": "Owner: Nina Rao @Nina · Expected: next week" } ],
  "decisions": [ { "title": "Can patients turn off SMS reminders and keep email only?",
    "text": "Today every patient with a phone number receives SMS reminders.",
    "meta": "Options: allow opt-out · clinic decides per patient · keep as today" } ] }
```

## `tracker`

Developer task track, from the task tracker plus reviews. One card per person (2 to 4). `done` and `open` are the week's task counts from your tracker. `pct` is progress confirmed by the lead. `items` are their tasks or phases with a state (`done` accent dot, `progress` light accent, `next` grey). Keep items to 6 per card and 55 characters each, and add subtask counts like "(3/5)" and "in PR review" where useful.

```json
{ "type": "tracker", "eyebrow": "Team · Task Tracker", "title": "Developer Task Track",
  "devs": [
    { "name": "Nina Rao @Nina", "project": "ClinicBook · Clinic Dashboard", "done": 2, "open": 2, "pct": 80, "state": "progress",
      "focus": "Onboarding and Doctor Schedules closed; Reminders in review.",
      "items": [
        { "text": "Phase 2 · Doctor Schedules (5/5)", "state": "done" },
        { "text": "Phase 4 · Reminders & Notifications, in review (5/5)", "state": "progress" },
        { "text": "Phase 3 · Reports & Exports (0/3)", "state": "next" } ] }
  ],
  "footnote": "Done/Open = Jira issues, Sep 26 - Oct 2; work in review stays open until merged. Progress % confirmed by the lead." }
```

## `table`

Next steps and owners. Usually the last content slide, with 3 to 6 rows.

```json
{ "type": "table", "eyebrow": "Looking Ahead", "title": "Next Steps & Focus Areas",
  "rows": [ { "project": "ClinicBook · Patient App", "owner": "Leo Park @Leo",
    "focus": "up to 130 chars", "current": "P3 · 40%", "state": "progress" } ] }
```

## Choosing slides

For `role: lead`, the agent follows the six questions: a `dashboard` first, then one or two slides per project (`rings` and `phase_bars` for phased work, `timeline` for something that moved through stages, `workstreams`, `rows` or `gallery` for descriptive work), optionally `review_insights`, then `attention`, then `tracker` (with an optional `activity`), and a `table` for the next period.

For `role: member` the deck is shorter, typically 5 to 8 slides, and skips `tracker` and `activity` unless you ask.

Rules the agent follows: never the same template on consecutive slides, one-line titles in the form "Project: Outcome", every item answers "so what", and a track's progress is the average of its phase percentages, with a footnote saying so.
