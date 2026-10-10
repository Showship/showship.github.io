---
title: Introduction
description: What Showship is, who it is for, and how a progress report comes together from your commits, pull requests and tasks.
seoTitle: Showship documentation: set up and build progress decks
---

Showship is an Agent Skill (a `SKILL.md` folder) for anyone who has to report what they built. Team leads use it to report the whole team to management. Individuals (developers, freelancers, contractors, founders) use it to report their own work to a manager, tech lead or client.

You run it inside each repo you touched. Your AI coding agent reads the commits, pull requests, reviews and replies, translates them into plain business language (or keeps them technical for engineers), and builds a slide deck with charts, owners, progress, blockers and the plan for the next period.

It works with **Claude Code**, plus **Codex** and **Antigravity** (experimental) and other agents that read `SKILL.md` folders.

```bash
npx showship
```

> [!NOTE]
> Showship is in beta. Slide templates, config keys and installer options may still change between releases. The Jira, Linear, Asana and ClickUp integrations and the Codex and Antigravity installs have not yet been tested against many real setups. Please [open an issue]({{issues}}) with feedback or bugs.

## Why it exists

Every week, sprint or month someone has to explain what got built: a team lead to business people, PMs, the boss and the CTO; a developer to their manager; a freelancer to their client. The raw material lives in GitHub ("add appointments migration", "fix N+1 on doctors list", a 2,000-word review on PR #12) and in the task tracker. Turning that into slides takes hours, and the result is often too technical for half the room.

Showship does the translation. The deck answers six questions:

1. What are we working on?
2. What has been delivered?
3. How far along is it? (percent, phases)
4. Who is doing what?
5. What is blocked, and what do you need from us? (blockers, decisions needed)
6. What happens next? (next week, sprint or month)

## Who it is for

| You are | Set | You get |
| --- | --- | --- |
| Team lead reporting to business or management | `role: lead`, `audience: business` | The whole team's progress in plain language: owners, percentages, blockers, decisions needed, what is next. |
| Team lead reporting to a CTO or engineering org | `role: lead`, `audience: engineering` | The same, with technical detail kept: architecture, test status, review findings. |
| Developer reporting to a tech lead or manager | `role: member`, `audience: engineering` | Only your commits, PRs you wrote or reviewed, and your tasks: what you shipped, what is in review, what you need. |
| Freelancer or contractor reporting to a client | `role: member`, `audience: business` | A client-ready update of your work, in their language, with your logo. |
| Solo founder or indie developer updating investors or a co-founder | `role: member`, `audience: business` | A short, polished progress deck from your repos. |

The installer asks these questions. You can change the answers in `config.json` at any time. See [Configuration]({{docs}}configuration/).

## What it does

- **Any reporting rhythm.** `weekly`, `biweekly`, `sprint`, `monthly` or `custom`. The period sets the default date range, the deck title ("Sprint 14 Progress Report") and the "next" slide. Any request can override it: "the last two weeks", "September", "Oct 1 to Oct 9".
- **Reads everything that matters.** Commits on all branches, every PR with activity in the period, full PR descriptions, reviews (approved or changes requested), conversation and inline review comments in chronological order. Bots are filtered out.
- **Understands your reviews.** Comments from the lead's GitHub account are tagged `(LEAD)` and treated as the most authoritative source. See [Code reviews]({{docs}}code-reviews/).
- **Plain language by default, technical when you want it.** A built-in jargon check flags terms like endpoint, schema, payload, JSON, 500 error and N+1, and suggests business wording before the deck is built.
- **Never invents numbers.** Percentages, owners, dates and blockers come from your data or from you. The agent asks one consolidated question for anything GitHub cannot tell it.
- **12 slide templates and 6 deck designs.** See [Slide templates]({{docs}}slide-templates/) and [Deck designs]({{docs}}deck-styles/).
- **Checks its own layout.** After the build, the deck is rendered and every slide is checked for text crossing the margins or colliding. See [Build and check]({{docs}}build-and-check/).
- **Your branding.** Company name, logo (borders trimmed automatically) and colour overrides from one config file.
- **Works across changing repos.** Collect per repo, build once. The set of repos can change every period.
- **Task tracker integrations.** Jira, Linear, Asana, ClickUp, Lark, or any tool your agent reaches through MCP. See [Task trackers]({{docs}}task-trackers/).
- **Any language in chat.** Talk to the agent in your own language. The deck is written in your configured deck language (English by default).
- **Local first.** Data stays on your machine, and your personal config is never shipped. See [Privacy]({{docs}}privacy/).

## How a report comes together

```text
 repo A ──┐  "collect"  reads commits + PRs + reviews  ->  <report>/repo-A.md  (business-language draft)
 repo B ──┤  "collect"  ...                             ->  <report>/repo-B.md
 repo C ──┘  "collect"  ...                             ->  <report>/repo-C.md
 (tracker)   once       Jira / Linear / Asana / ClickUp / Lark  ->  <report>/tasks.md  (optional)

 anywhere    "build"    merges drafts + your notes, asks what is missing, runs the jargon check
                        ->  report.json  ->  Sprint_14_Progress_Report_<date>.pptx
```

Everything for one report lives in one folder, for example `~/Showship/2026-10-09/`. The deck is generated from `report.json`, so edits are plain requests: "change slide 4's title" makes the agent edit the JSON and rebuild.

## Requirements

| Tool | Why | Install |
| --- | --- | --- |
| An AI coding agent | Runs the skill | [Claude Code](https://docs.claude.com/en/docs/claude-code), Codex or Antigravity |
| Node.js 18 or newer | Installer and deck builder | [nodejs.org](https://nodejs.org) |
| git | Reads commits | Your package manager |
| [GitHub CLI](https://cli.github.com) (`gh`) | Reads PRs, reviews and comments | `brew install gh && gh auth login` |
| LibreOffice (optional) | Lets the agent render slides to images and check the layout | `brew install --cask libreoffice` |
| A task tracker (optional) | Jira Cloud, Linear, Asana, ClickUp or Lark | See [Task trackers]({{docs}}task-trackers/) |

`gh auth login` with your own account is enough: you can read your teammates' PRs just as you do in the browser. If your organisation uses SAML SSO, authorise the token for the org when GitHub asks.

## Where to go next

- [Install Showship]({{docs}}install/) and answer the installer's questions.
- [Make your first report]({{docs}}quick-start/) from a repo you worked in this week.
- Browse [usage examples]({{docs}}examples/) for leads, developers and freelancers.
