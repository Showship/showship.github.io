---
title: Code reviews
description: How Showship reads a lead's reviews and PR discussion, and how to write structured reviews that map straight onto slides.
seoTitle: Write code reviews that turn into progress slides
---

Showship is at its best when the lead writes structured reviews. Any format works, but sections like the ones below map directly onto the deck.

```markdown
# Code Review: clinicbook-api PR #12, CB-88, Phase 4: Appointment Reminders

## Summary: what the feature does (business value)

## Verification: "all 212 automated tests pass"

## Subtask Coverage: 4 verified, 1 not yet, so "4 of 5 parts verified", suggested ~80%

## Critical / Blocker: "fix needed before release" (described by user impact)

## Product/Policy Decision Needed: becomes the "Decisions Needed" slide

## Verdict: APPROVED / NEEDS WORK, which sets the status
```

## How each section is used

The lead's review comments are the most authoritative source in the digest. They are tagged `(LEAD)` when your GitHub login is in `leadLogins`.

| Review section | Used for |
| --- | --- |
| Title line: repo, PR number, task id, phase name | Which project, track and phase this is. The task id stays in the draft as a reference and does not go on slides. |
| Header facts: author, branch, scope, tracker status, date | The owner (the GitHub author, mapped through config) and the size of the change. |
| Summary | What the feature does, rewritten as user or business value. |
| Verification (test results, probe tables) | Quality evidence such as "all 212 automated tests pass". The technical cases are dropped. |
| Subtask Coverage (verified, partly verified, missing) | Progress evidence. Four of five verified suggests about 80% and "4 of 5 parts verified". The agent confirms the percentage with you. |
| Critical / Blocker | "Fix needed before release", described by the effect on users and the size of the fix. It goes on the Blockers side of the `attention` slide if it delays release. |
| Optional follow-up refactoring | Usually omitted. At most "minor improvements planned". |
| Product or policy decision needed | Decisions Needed on the `attention` slide: the business question, why it matters, the options. |
| Items the PR leaves open on purpose, or already decided | Omitted unless they change scope. |
| Verdict | APPROVED becomes "Approved, ready to release" (or Delivered if merged). NEEDS WORK becomes "In review, fix needed". |

Developers' PR descriptions and replies tell the agent what was built and what was fixed since the review. A blocker answered with "fixed" plus new commits is resolved, pending re-review.

In `member` mode the same structure applies to reviews you received from your lead, which explain status, fixes and decisions, and to reviews you gave, which count as your contribution.

## What reaches the slides

Code, file paths, error codes, class names, test case tables and raw comments never reach the slides. Problems are attributed to the work, not to people: "rework requested on the image upload handling", not "Nina's code failed". Positive callouts may name people.

## PR signals

PRs are usually the best unit for a business summary, because one PR is about one feature or fix.

| PR signal | How it is used |
| --- | --- |
| Title and description | Name the feature in business terms. Descriptions often state the goal ("so that patients can..."), and that intent is reused. |
| Merged this period | Delivered. The strongest evidence for "Completed" for that piece of scope. |
| Open, review requested | In review: built, awaiting approval. |
| Draft | In development. |
| Closed without merge | Usually omitted, unless it signals a change of direction. |
| Review: changes requested | The quality gate working: "Rework requested in review; fix in progress." The author is not named or blamed. |
| Review: approved | Supports "ready to ship" or "merged". |
| Comments about waiting, blocked, dependencies or decisions | A candidate blocker. The agent asks you to confirm it before it goes on a slide. |
| Comments agreeing scope ("let's move X to next sprint") | A scope decision, useful for the next-steps slide. |
| Many review rounds, or a PR open a long time | A possible risk, mentioned neutrally ("under review for N days") only if the lead agrees. |
| The lead's own reviews | Counted as review and oversight work for the lead. |

## Translating commits and PRs

Business readers want to know what capability now exists, for whom, and why it matters. The agent follows these principles when it writes drafts:

1. **Group, do not list.** Ten commits on the booking form become one item: "Appointment booking form completed".
2. **Outcome over activity.** "Patients can now book an appointment" beats "added POST /appointments endpoint".
3. **Name the module the business knows** (Patient App, Booking, Reminders, Reports), not the code module.
4. **State the status honestly.** Commits show that work happened, not that it is finished. A feature is Completed only if the commits clearly finish it (tests, final wiring, merge to main) or the lead confirms it.
5. **Write for the least technical person in the room.**
6. **Fixes are about the user's experience:** "Fixed profile photo uploads failing for customers", not "fix null check in uploader".
7. **No numbers it cannot back up.** Commit counts and lines changed are not progress percentages.

| Technical | Plain wording |
| --- | --- |
| API or endpoint | Describe the capability ("clinics can change their reminder settings"), or "system connection" |
| Database schema, migration, models | "Data foundation", "data structure", "database setup" |
| PR merged | "Approved and integrated", "delivered" |
| PR open or in review | "Built, in final review" |
| 500 error or exception | "An error page instead of a clear message" |
| Duplicate job or retry | "The same message could be sent twice" |
| N+1 or slow query | "A database performance issue" |
| Test suite green (212/212) | "All 212 automated tests pass" |
| Refactor | "Restructuring code to make future changes faster" |
| Deploy, production | "Release", "live" |
