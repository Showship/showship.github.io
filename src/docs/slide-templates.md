---
title: Slide templates
description: The report.json fields and the thirteen slide templates, from dashboard and timeline to tracker and table, with character limits.
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
  "style": "corporate",                       // optional: showship | paper | ember | classic | modern | corporate | vivid
  "slides": [ /* content slides, in order; title and closing slides are added automatically */ ]
}
```

Every content slide has `type`, `eyebrow` (a short label, shown in sentence case) and `title` (one line).

**States** used across templates: `done` (accent colour), `progress` (light accent), `blocked` (warning colour) and `next` (grey, not started). Colours depend on the design.

**Icons** are Lucide names without the `Lu` prefix, in PascalCase: `Database`, `Smartphone`, `FileText`, `Users`, `UserRound`, `Briefcase`, `RefreshCw`, `ShieldCheck`, `TrendingUp`, `Code`, `FlaskConical`, `Rocket`, `Target`, `ListChecks`, `Workflow`, `Component`, `Landmark`, `CalendarClock`, `Headset`, `LayoutDashboard`, `CircleCheckBig`, and any other name from `react-icons/lu`.

### How designs render the same JSON

`classic` renders it with its own editorial layouts (for example `rings` as large figures, `phase_bars` as phase lists, `timeline` vertically). `showship` has its own signature layouts (colour per project, gauges, pill tracks, a milestone trail). `paper` has its own printed-report layouts (ruled lists, big figures, a single trail line for timelines; `rows` ignores `illustration`). `ember` has its own dark-panel layouts (a hero panel with one giant figure, vertical pillars for `rings`, a zigzag trail for timelines, banded rows; `rows` ignores `illustration`). `modern`, `corporate` and `vivid` share the card layouts.

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

A screenshot strip: 2 to 7 screenshots or photos with step labels. Different shapes are fine: each image is padded to the first one's shape, never stretched or cropped.

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

## `task_detail`

Tasks written out in full, from the tracker's subtasks, your drafts and the lead's reviews. Use it after a project's overview slides and after `tracker`, so a reader can recall what each task was a week later. One to three tasks per slide: one task gets the whole width (summary on the left, steps on the right), two or three become columns.

Each task has a `title` (50 characters), `owner` (30), `state` and a `status` word (22), a `summary` (200) saying what it is for and what happened this period, and up to five `points` (64 each): its subtasks or steps, each with its own `state` (default `done`). Optional `image` is a screenshot or photo of the task (a path relative to `report.json`) with a short `caption` (60). One task shows it large beside the steps; two or three show a thumbnail under the summary, which takes room from the steps. Optional `project` sets the colour in the Showship, Paper and Ember designs, and `footnote` (140). Three columns are tight: give each task about four points and 140 characters of summary, or use two tasks per slide and split the rest onto another slide. The agent plans these slides per project (repo): up to three tasks fit one slide; with more, it splits them across slides of two or three tasks with the same `project` and "part 1 of 2" in the eyebrow; a single large task gets its own slide; small tasks of one product share a slide. The builder warns when a column would run past its panel.

```json
{ "type": "task_detail", "eyebrow": "ClinicBook · Patient App", "title": "ClinicBook: What Was Done on Each Task",
  "tasks": [
    { "title": "P3 · Booking Calendar", "owner": "Leo Park @Leo", "state": "progress", "status": "In progress",
      "summary": "Patients pick a doctor, a day and a time slot in one screen. Free slots update as others book.",
      "points": [
        { "text": "Doctor and day picker built", "state": "done" },
        { "text": "Booking confirmation screen", "state": "progress" },
        { "text": "Rescheduling an existing booking", "state": "next" } ] }
  ],
  "footnote": "Detail comes from the task tracker and the lead's code reviews." }
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

## Adding screenshots and photos

Slides have no pictures unless you ask for them, and the example decks on this site have none. When you want them, say so in your prompt or write it in `notes.md`. Three templates take pictures: `task_detail` (a picture of one task), `rows` (one screenshot beside the text) and `gallery` (2 to 7 screens in a row).

```text
Add a screenshot of the booking screen to the Booking Calendar task
Use the three phone screenshots in ~/Desktop/shots as a gallery slide
Take screenshots of the sign-in and search screens from the patient app repo
Add the whiteboard photo to the architecture slide
```

### Your own files

Give the path in the prompt. The agent copies the files into the report folder under `images/` and refers to them with relative paths, for example `images/booking.png`.

- **Formats:** PNG, JPG, GIF, WebP and SVG. HEIC photos from a phone must be converted to JPG first; on a Mac, `sips -s format jpeg in.heic --out out.jpg` does it.
- **Handled for you:** phone photos are rotated upright, WebP and similar formats are converted so PowerPoint can show them, and files wider than 1800 pixels are scaled down so the deck stays small.
- **Web addresses** are not used directly. The agent downloads the image into `images/` first and tells you.
- **A missing or unreadable file** is skipped with a warning and the slide is built without it. A `gallery` with fewer than two usable images is left out.

### Screenshots from a project repo

Ask the agent to capture them. It finds how the app runs from the README or `package.json`, tells you what it is about to start, and asks before it starts servers, installs packages or uses anything that needs a login. It captures phone screens at 390 x 844 and web pages at 1440 x 900 as PNG files in `images/`. If the app cannot be run, it asks you for screenshots instead of guessing. A test account or seeded demo data makes this work best.

### Before you use a picture

Do not put pictures on a slide that show real customer data, personal details, tokens, internal addresses or credentials. The agent looks at each image, but you know what is sensitive. Ask for a cropped image or a test account instead.

### In report.json

If you edit the file by hand, give each image as a path relative to `report.json`, and run the check. It fails on a missing file or an unsupported type.

```json
{ "type": "task_detail", "title": "ClinicBook: Booking Calendar",
  "tasks": [ { "title": "Booking screen", "state": "progress", "status": "In progress",
    "summary": "Patients pick a doctor, a day and a time in one screen.",
    "image": "images/booking.png", "caption": "Booking screen, this week",
    "points": [ { "text": "Doctor picker", "state": "done" } ] } ] }
```

## Choosing slides

For `role: lead`, the agent follows the six questions: a `dashboard` first, then one or two slides per project (`rings` and `phase_bars` for phased work, `timeline` for something that moved through stages, `workstreams`, `rows` or `gallery` for descriptive work), optionally `review_insights`, then `attention`, then `tracker` (with an optional `activity`), and a `table` for the next period.

For `role: member` the deck is shorter, typically 5 to 8 slides, and skips `tracker` and `activity` unless you ask.

Rules the agent follows: every number has a source and says how it was counted, the next period's plan comes from you or your tracker and is never invented, status words match the data, every collected repo appears on a slide, never the same template on consecutive slides, one-line titles in the form "Project: Outcome", every item answers "so what", and a track's progress is the average of its phase percentages, with a footnote saying so.
