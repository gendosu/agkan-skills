---
name: execute-subtask
description: "[DEPRECATED] Use agkan-subtask instead. Use when a task has been selected and you need to implement it in an isolated (forked) context - handles in_progress update, branch creation, implementation, PR creation, and marking done."
user-invokable: false
metadata:
  context: fork
---

> **DEPRECATED**: This skill has been renamed. Please use `agkan-subtask` instead.
> `Skill("agkan-subtask")`

# execute-subtask

## Overview

Workflow to implement a selected task on a fork (worktree), create a PR, and complete the task.

### About `context: fork` in frontmatter

The `context: fork` field in the frontmatter indicates that this skill is designed to run in an isolated worktree (forked context). When an Agent invokes this skill, it executes in a separate worktree environment rather than the current working directory. This isolation ensures that branch creation and file changes do not interfere with the parent context.

---

## Workflow

### 1. Create Branch

```bash
git checkout -b <branch-name>
```

Branch name is generated from task ID and title (example: `feat/42-add-login-page`).

### 2. Write Branch Name to Task

```bash
# First, retrieve the existing body
agkan task get <id> --json
# Then update by concatenating existing body with branch name
agkan task update <id> body "<existing body>\n\nBranch: <branch-name>"
```

### 3. Implementation

Implement according to the task content.

Refer to /key-guidelines during implementation to maintain code quality.

### 4. Commit and Push

```bash
git add -A
git commit -m "<commit message>"
git push -u origin <branch-name>
```

### 5. Create PR

```bash
gh pr create --title "<title>" --body "<body>"
```

### 6. Add PR Information to Task

```bash
# First, retrieve the existing body
agkan task get <id> --json
# Then update by concatenating existing body with PR URL
agkan task update <id> body "<existing body>\n\nPR: <PR URL>"
```

### 7. Update Task to Review

Only execute this step if implementation succeeded — specifically, if git push (Step 4) and PR creation (Step 5) both completed without critical errors.

**If a critical error occurred** (e.g., git push failed, PR creation failed, permission denied), do NOT update the status to review. Leave the task as `in_progress`.

**If user confirmation was required / execution was interrupted mid-task** (e.g., permission denied for a file edit, user asked a clarifying question, tool use was blocked), do NOT update the status to `review`. Leave the task as `in_progress`.

`review` status means implementation is **fully complete** — a PR has been successfully created and is awaiting human review. It does **not** mean "paused waiting for user input".

**If implementation succeeded**, update to review:

```bash
agkan task update <id> status review
```

---

## Important Notes

- Do not mark task as done before PR is merged (mark as done after PR review and merge)
- **Step 7 (status → review) must only be executed when implementation succeeded** — do not update to review if a critical error occurred or if user confirmation is pending
- **`review` status is exclusively for tasks where implementation is fully complete and a PR is awaiting human review**
- This skill is used after task selection (task selection is done with `execute-task` skill)
