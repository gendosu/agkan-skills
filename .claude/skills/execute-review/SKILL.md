---
name: execute-review
description: Use when checking review tasks against GitHub PR status to automatically move them to done or closed.
---

# execute-review

## Overview

Workflow to retrieve tasks with Review status in agkan, check the merge/close status of GitHub PRs, and automatically update their status.

---

## Workflow

### 1. Retrieve Review tasks

```bash
agkan task list --status review --json
```

### 2. Confirm PR URL for each task

Extract the PR URL from the task body in the format `PR: <URL>`.

If no URL is found, execute the following recovery flow:

#### Recovery flow when PR URL is missing

**Step 1: Search GitHub for related PRs**

```bash
gh pr list --search "<task title>" --json number,title,url,state --limit 5
```

**Step 2: If a matching PR is found**

Show the candidate PR(s) to the user and ask for confirmation using `AskUserQuestion`:

> PR URLがタスクbodyに見つかりませんでした。以下のPRが関連している可能性があります。該当するPRを選んでください（該当なしの場合は「なし」と回答）:
> 1. #123 - <PR title> (<URL>)
> 2. ...

If confirmed, update the task body to append the PR URL:

```bash
agkan task update <id> body "<existing body>\n\nPR: <URL>"
```

Then continue to Step 3 (check PR status).

**Step 3: If no matching PR is found or user answers "なし"**

Use `AskUserQuestion` to ask the user directly:

> タスク #<id>「<title>」に対応するPR URLを入力してください（スキップする場合は「skip」と回答）:

- If URL is provided: update the task body and continue to check PR status
- If user answers "skip": skip the task and move to the next one

### 3. Check PR status on GitHub

```bash
gh pr view <PR URL> --json state,mergedAt
```

| Field | Meaning |
|-----------|------|
| `state` | `OPEN` / `CLOSED` / `MERGED` |
| `mergedAt` | Merge date/time (null if not merged) |

### 4. Move status based on PR status

| PR State | agkan Status | Command |
|--------|----------------|---------|
| `MERGED` | `done` | `agkan task update <id> status done` |
| `CLOSED` (mergedAt is null) | `closed` | `agkan task update <id> status closed` |
| `OPEN` | No change | Skip (still under review) |

---

## Decision Flow

```
Retrieve all Review tasks
    ↓
Repeat for each task
    ↓
Does the body contain "PR: <URL>"?
   No  → Run recovery flow
         ↓
         Search GitHub for related PRs
         ↓
         Found?
            Yes → Show candidates, ask user to confirm
                  Confirmed → Update task body, check PR status
                  "なし"   → Ask user to input URL directly
                              Provided → Update task body, check PR status
                              "skip"   → Skip task
            No  → Ask user to input URL directly
                  Provided → Update task body, check PR status
                  "skip"   → Skip task
   Yes → Check PR status
    ↓
What is the PR state?
   MERGED  → Move to done
   CLOSED  → Move to closed
   OPEN    → Skip (waiting for review)
    ↓
Move to next task (repeat until all tasks are processed)
```

---

## Notes

- PR URL is expected in the format `PR: <URL>` within the task body
- If PR URL is not found, run the recovery flow: search GitHub for related PRs, then ask user to confirm or provide URL manually
- `done` means successful completion, `closed` means suspended or withdrawn
- The `gh` command is required and will not work in environments where it is unavailable
