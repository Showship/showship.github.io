---
title: Usage examples
description: Plain requests for team leads, developers, freelancers and anyone who needs a different time range, edit or language.
seoTitle: Usage examples for leads and developers
---

Everything is driven by plain requests to your agent, in English or your own language.

## Team lead: weekly team report

```text
# in each repo the team worked on this week
Collect this week's commits and PRs for the report

# the agent asks what GitHub cannot tell it. Answer in a sentence:
The booking calendar is at 40%. We're waiting on the SMS provider to approve
our sender name. Exclude Sam, he's on leave.

# once all repos are collected
Build the report
```

## Sprint review

```text
# config: period "sprint", sprintDays 14
Collect sprint 14 for the report
Build the sprint 14 report and add a slide on what moved to sprint 15
```

## Developer: what did I do this week

```text
# config: role "member", audience "engineering"
Collect my work this week for the report        (run in each repo you touched)
Build my report and keep it to 5 slides
```

Only your own commits, the PRs you authored or reviewed, and your tasks are collected.

## Freelancer: monthly client update

```text
# config: role "member", audience "business", period "monthly", style "corporate"
Collect September's work for the client report
Build the report for Acme. They don't know what an API is, keep it simple
Add a slide asking the client to approve the new booking screen design
```

## Different time ranges

```text
Collect the last two weeks, I skipped last Friday's report
Make a monthly summary for September from all repos
Collect from Oct 1 to Oct 9 only
```

## Editing the deck

```text
Change slide 4's title to "Reminders: Ready for Release"
Use the vivid style this time
Move the blockers slide before the phase breakdown
Add a timeline slide for the App Store setup: blocked, documents sent, approved
The Clinic Dashboard track is 85%, not 80%. Fix it everywhere
Remove the team activity chart
```

## Task tracker and people

```text
Switch the task tracker to Linear
Only include the ENG and MOBILE teams from Linear
"nina-dev" on GitHub is Nina Rao, show her as "Nina Rao @Nina"
Leave Sam out of all reports from now on
```

## Quality and language

```text
Run the jargon check and fix anything a non-technical manager wouldn't understand
Make the deck for engineers this time, keep the technical terms
Write the slides in Japanese
```

## Re-using past reports

```text
Rebuild the last report in the corporate style
Compare this sprint with the last one: what moved, what's still stuck?
Show me what's been blocked for more than two weeks
```
