---
title: Contributing
description: Repository layout, how to add a slide template or a task tracker collector, and where to send issues and pull requests.
seoTitle: Contributing to Showship
---

Issues and pull requests are welcome at [github.com/Soe-Moe/showship]({{repo}}). Useful contributions include new slide templates, collectors for other trackers (Trello, GitHub Projects, Notion, Monday), better jargon rules, more languages, and reports from Codex and Antigravity users.

## Repository layout

```text
bin/install.js            npx installer
skill/                    the agent skill (copied to <skills folder>/showship)
  SKILL.md                instructions the agent follows
  config.example.json
  scripts/                collect_commits.sh, collect_prs.sh, collect_tasks.js
                          build_deck.js, lint_report.js, check_deck.js
                          render_pdf.js, make_previews.js, schema.js
    tasks/                common.js, jira.js, linear.js, asana.js, clickup.js, lark.js, mcp.js
  references/             templates.md, report.schema.json, translation_guide.md, design_rules.md
  examples/               report.example.json
  assets/logo.svg         default logo (the Showship mark)
docs/                     preview images and example decks
brand/                    logo and icon files
```

## Adding or changing a slide template

Read `skill/references/design_rules.md` first. Then:

- Change a design by editing its definition in `STYLES` and its layout functions in `build_deck.js`. Do not patch the generated `.pptx`.
- A new slide type needs its definition in `references/report.schema.json` (fields, counts and `maxLength` limits), its description in `references/templates.md`, an implementation for every design, and an entry in the example report.
- Build the example in every design and run `check_deck.js` on each. Then add a long-text case with labels at their character limits and run it again. A template that only works with short example text is not finished.
- Refresh the `docs/` images with `make_previews.js`.

## Adding a task tracker collector

Add a file in `skill/scripts/tasks/` that returns the normalized rows described in `tasks/common.js`, and register it in `collect_tasks.js`.

## License

Showship is [MIT licensed]({{license}}), copyright Soe Moe Oo @Skylar.
