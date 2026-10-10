---
title: Task trackers
description: Pull tasks, subtasks, assignees and due dates from Jira, Linear, Asana, ClickUp, Lark or any tool your agent reaches through MCP.
seoTitle: Task trackers for Jira, Linear, Asana and more
---

Commits and PRs show what was built. The task tracker shows what was planned: phases, subtasks, owners and due dates. With a tracker configured, the agent collects it once per report into `<report>/tasks.md` and uses it for "who is doing what", subtask-based progress ("4 of 5 parts done"), overdue risks and the developer task track slide. The digest looks the same whichever tool you use.

Pick the tool in the installer, or set `tasks.provider` in `config.json` at any time.

## Providers

| Tool | `provider` | Settings in `config.json` | Credentials (environment) |
| --- | --- | --- | --- |
| Jira Cloud | `jira` | `tasks.jira.baseUrl`, `tasks.jira.projects` (keys), optional `tasks.jira.jql` | `JIRA_EMAIL`, `JIRA_API_TOKEN` ([create a token](https://id.atlassian.com/manage-profile/security/api-tokens)) |
| Linear | `linear` | Optional `tasks.linear.teams` (team keys) | `LINEAR_API_KEY` (Settings, Security and access, Personal API keys) |
| Asana | `asana` | `tasks.asana.projects` (project gids from the URL) | `ASANA_TOKEN` (Settings, Apps, Developer apps, Personal access tokens) |
| ClickUp | `clickup` | `tasks.clickup.lists` (list ids from the URL), or `tasks.clickup.workspaceId` plus optional `spaces` | `CLICKUP_TOKEN` (Settings, Apps, API Token) |
| Lark | `lark` | Optional `tasks.lark.tasklists` | `lark-cli` signed in as you |
| Any tool via MCP | `mcp` | `tasks.mcp.name`, `tasks.mcp.server`, optional `lists` and `instructions` | The MCP server's own connection |
| None | `none` | | git and GitHub only |

Put credentials in your shell profile so your agent sees them. Never put tokens in `config.json`.

```bash
# ~/.zshrc (or ~/.bashrc)
export JIRA_EMAIL="you@acme.io"
export JIRA_API_TOKEN="..."
```

## What gets collected

Every open task plus everything completed in the period, grouped by assignee, with nested subtasks (Jira child issues and sub-tasks, Linear sub-issues, Asana, ClickUp and Lark subtasks), subtask counts and overdue flags. Canceled Linear issues are skipped, and people in `exclude.people` are left out. Map tool users to display names in `taskUsers` (by id, email or name).

| Tool | "Task" | Subtasks | Done means |
| --- | --- | --- | --- |
| Lark | Task in a tasklist | Subtasks (nested) | Completed |
| Jira | Issue (epic, story or task) | Child issues and sub-tasks in the result set | Status category Done |
| Linear | Issue | Sub-issues | Completed (canceled is skipped) |
| Asana | Task in a project | Subtasks (nested) | Completed |
| ClickUp | Task in a list | Subtasks (nested; earlier-closed ones kept for counts) | Status type done or closed |
| MCP (custom) | Whatever the tool calls a task (page, item, card, issue) | Nested `subtasks` you include | What `tasks.mcp.instructions` says, else the tool's done or closed state |

Try the collector directly:

```bash
node ~/.claude/skills/showship/scripts/collect_tasks.js 2026-10-03 2026-10-09
node ~/.claude/skills/showship/scripts/collect_tasks.js 2026-10-03 2026-10-09 --provider linear
```

If a tracker is not set up (provider `none`, or a missing token or setting), the collector exits with code 2 and the digest says what to set. The agent tells you once and carries on with GitHub data only.

## How the agent uses tasks

- **Who is doing what** and **what is planned** come from the tracker: each developer's tasks, phases and open work.
- **Progress evidence** comes from subtask counts, such as `[subtasks 4/5]`. Work items are the subtask leaves, and a task without subtasks counts as one.
- **Cross-check with GitHub.** "Done" in the tracker means the developer finished the work items. The PR review decides whether it is ready to release. A phase whose subtasks are all done but whose PR is still in review is In review, not Completed, and stays open on the tracker slide until merged.
- **Match tasks to PRs** by the task id or key in the review title, PR title or branch (for example `CB-88`, `CLINIC-42`, `ENG-12`), or by phase name.
- Overdue tasks and tasks with no assignee are candidates for Blockers and risks. The agent confirms them with you first.
- In `member` mode the collector keeps only your own tasks.

## Custom tool via MCP

Using Notion, Monday, GitHub Projects, Trello, Jira Server or an in-house tracker? If your agent can reach it through an MCP server, pick **Custom (MCP)** in the installer. It then asks (all optional, Enter to skip) which MCP server holds your tasks, the tool's name for the report, which boards or databases to read, and how to read status and assignee in that tool.

Without prompts:

```bash
npx showship --yes --tasks mcp --mcp-server notion --mcp-name Notion --mcp-lists "Sprint board"
```

It writes this to `config.json`, which you can also edit by hand:

```jsonc
"tasks": {
  "provider": "mcp",
  "mcp": {
    "name": "Notion",                       // shown in the report
    "server": "notion",                     // the MCP server your agent has connected
    "lists": ["Sprint board"],              // optional: boards, databases or projects to read
    "instructions": "Status 'Done' means done; the 'Owner' property is the assignee."
  }
}
```

1. Connect the tool's MCP server to your agent (Claude Code: `claude mcp add ...`; Codex and Antigravity: their MCP settings).
2. Collect as usual. The agent reads open tasks and the tasks completed in the period through MCP, read-only (it never creates or edits anything), saves them to `<report>/tasks.mcp.json`, and runs the collector on that file:

   ```bash
   node ~/.claude/skills/showship/scripts/collect_tasks.js 2026-10-03 2026-10-09 --provider mcp --input tasks.mcp.json
   ```

3. From there it works like every other tracker: the same digest, `taskUsers` mapping, exclusions and developer task track slide.

The file format is forgiving about field names and is documented in `skill/scripts/tasks/mcp.js` in the repository, so you can also export tasks from any tool yourself and pass them with `--input`.

## Add a built-in collector

Want a built-in collector for another tool? Add a file in `skill/scripts/tasks/` that returns the normalized rows described in `tasks/common.js`, and register it in `collect_tasks.js`. Pull requests are welcome.
