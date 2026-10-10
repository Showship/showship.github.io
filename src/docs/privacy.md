---
title: Privacy
description: Showship runs locally with no server or account. What it reads, what it stores, what leaves your machine, and how to turn off the update check.
seoTitle: Privacy: what Showship reads, stores and sends
---

Showship runs locally. There is no Showship server and no account.

## What is read

Data is read through `git`, `gh` (the GitHub API, with your credentials), and optionally your task tracker's API (Jira, Linear, Asana, ClickUp) or `lark-cli`. Drafts and decks are written to your reports folder.

## What is stored

- `config.json` holds names, ids and paths. It is git-ignored and excluded from the npm package.
- Generated reports and decks are git-ignored and excluded from the npm package.
- Tracker tokens are read from environment variables only. They are never written to config or report files.

## What leaves your machine

The only network call that is not your own GitHub or tracker access is the update check: `npm view showship dist-tags` at the start of a session. It sends only the package name to the npm registry. Nothing from your repos, reports or config is sent.

Turn it off with `"updateCheck": false` in `config.json`.

## Your AI agent

Your AI agent processes the collected text as part of your session, like any other file you open with it. Check your agent's own data policy for how it handles session content.

## Task tools through MCP

With a custom tool via MCP, the agent reads tasks through the MCP server you connected, read-only: it never creates, edits, moves or comments on anything in the tool.
