---
name: agkan-review
description: Use when checking review tasks against GitHub PR status to automatically move them to done or closed.
---

# agkan-review

## Overview

Workflow to retrieve tasks with Review status in agkan, check the merge/close status of GitHub PRs, and automatically update their status.

---

## Workflow

### 1. Retrieve Review tasks

```bash
agkan task list --status review --json
```

### 2. Confirm PR URL for each task

First, extract the PR URL from the task body in the format `PR: <URL>`.

If no URL is found in the body, check the task metadata as a fallback:

```bash
agkan task meta list <id>
```

Use the value of the `pr` key if present.

If no URL is found in either the body or metadata, skip the task and output a message indicating manual verification is needed.

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

### 5. Add comment recording the reason for status change

After updating status to `done` or `closed`, record the merge date/time and reason:

```bash
agkan task comment add <id> "<comment>"
```

Comment format by status:

| Status | Comment Example |
|--------|----------------|
| `done` | `Merged at <mergedAt>. PR was merged and task is complete.` |
| `closed` | `PR was closed without merging. Task moved to closed.` |

Example commands:

```bash
# When merged
agkan task comment add <id> "Merged at 2026-03-22T10:00:00Z. PR was merged and task is complete."

# When closed without merge
agkan task comment add <id> "PR was closed without merging. Task moved to closed."
```

---

## Decision Flow

```
Retrieve all Review tasks
    ↓
Repeat for each task
    ↓
Does the body contain "PR: <URL>"?
   Yes → Use that URL
   No  → Check metadata: agkan task meta list <id>
            Does metadata contain "pr" key?
               Yes → Use that URL
               No  → Skip (output message prompting manual verification)
    ↓
Check PR status
    ↓
What is the PR state?
   MERGED  → Move to done → Add comment with mergedAt timestamp
   CLOSED  → Move to closed → Add comment noting PR closed without merge
   OPEN    → Skip (waiting for review)
    ↓
Move to next task (repeat until all tasks are processed)
```

---

## Notes

- PR URL is first looked up in the task body in the format `PR: <URL>`
- If not found in the body, the `pr` key from `agkan task meta list <id>` is used as a fallback
- If PR URL is not found in either location, prompt for manual verification (skip task)
- `done` means successful completion, `closed` means suspended or withdrawn
- The `gh` command is required and will not work in environments where it is unavailable
