---
title: Build and check
description: Build a deck from report.json, run the language and layout checks, and understand the rules every template follows.
seoTitle: Build a deck and check its layout
---

The agent runs these for you, but they are plain Node scripts, so you can run them yourself. The commands below assume the skill is installed for Claude Code (`~/.claude/skills/showship`).

## Build a deck

```bash
node ~/.claude/skills/showship/scripts/build_deck.js report.json out.pptx
```

Branding defaults (company, presenter, logo, style, theme) come from the skill's `config.json`. Values in `report.json` win. See [Slide templates]({{docs}}slide-templates/) for the fields.

## Check the language and structure

```bash
node ~/.claude/skills/showship/scripts/lint_report.js report.json --audience business
```

`lint_report.js` validates `report.json` against `report.schema.json`: wrong or missing fields, bad values, text longer than its slot, and typos with a "did you mean" hint. It also checks the language. The deck is shown to business people, PMs and the CTO in one meeting, so slide text has to be understandable without engineering background. It flags developer jargon and suggests plain wording.

- **FIX** findings must be rewritten. The exit code is 1 while any remain.
- **CHECK** findings are warnings. They are fine if the term is explained in the same sentence or is an official plan name.
- With `--audience engineering`, technical terms are fine and only code formatting and file names are flagged.

## Check the layout

```bash
node ~/.claude/skills/showship/scripts/check_deck.js out.pptx --png
```

The deck is rendered with LibreOffice and each slide is checked for text that crosses the slide margins (`EDGE`, closer than 0.45 in) or collides with other text (`OVERLAP`). The slide images land in `out-qa/` so you and the agent can look at them. Exit code 1 if anything is flagged.

The check needs [LibreOffice](https://www.libreoffice.org/) and poppler (`brew install poppler`), plus the deck's fonts installed on the machine. Without them it reports that it could not render. The check is only as honest as the fonts it renders with: if Poppins or Arial is missing, a substitute font is used and the result is unreliable. `lint_report.js` also fails text that is longer than its slide slot, so overflow is caught before the build.

> [!NOTE]
> Building is not finishing. After every build the agent renders the deck, then looks at every PNG in `out-qa/`, because the script cannot see a half-empty card, a faded label or an unbalanced layout. If LibreOffice is missing, the agent says the deck was not rendered and checks text against the character limits instead.

## Rules every template follows

These apply to every design, and they are what the layout check enforces.

- **Nothing leaves its box.** Text sits inside its shape and inside the 0.7 in side margins. Text never relies on shrink-to-fit, because PowerPoint applies it only when someone edits the box and LibreOffice ignores it. Limits are written so text fits at its set size.
- **Legible at presentation size.** Slide titles are at least 26 pt, big figures 32 pt, body text 12 pt, and labels and chips 11 pt. Nothing is below 11 pt. Body text contrast is at least 4.5:1, and colour never carries meaning alone: status is colour plus a word.
- **Two typefaces at most**, one for headings and figures and one for body, both installed on the machine that opens the file.
- **Sentence case** for labels and status words. No wide-tracked all caps, no em dashes in slide text, no emoji.
- **One accent per slide**, plus a state colour used only for risk. A project keeps one colour on every slide.
- **Layout comes from the content.** Never the same layout on two consecutive slides, and decoration is the brand motif (the ship trail) or nothing.
- **Content honesty.** Every number comes from the collected data or from you. A chart answers a question the slide title states.

## Preview images and example decks

The README previews and the three example decks are generated from the example report, so the pictures always match the current templates:

```bash
node skill/scripts/make_previews.js
```

It needs LibreOffice and poppler, and writes into `docs/` in the repository.

## Editing an existing report

`report.json` is the source of truth. To change a deck, edit `report.json`, re-run the language check and rebuild. Usually you just ask the agent: "change slide 4's title", "use the vivid style this time", "remove the team activity chart".
