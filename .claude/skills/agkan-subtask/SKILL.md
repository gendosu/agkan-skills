---
name: agkan-subtask
description: Use when a task has been selected and you need to implement it in an isolated (forked) context - handles in_progress update, branch creation, implementation, PR creation, and marking review.
user-invokable: false
metadata:
  context: fork
---

# agkan-subtask

## Overview

Workflow to implement a selected task on a new branch, create a PR, and move to review.

---

## Workflow

### 1. Update Task to In Progress

```bash
agkan task update <id> status in_progress
```

### 2. Check for Existing Branch/PR

Before creating a new branch, inspect the task body for existing branch and PR associations (see `agkan/SKILL.md` — Body Conventions).

```bash
agkan task get <id> --json
```

Parse the task body for the following labels:

```
Branch: <branch-name>
PR: <URL>
```

**Case A — Branch label found:**

Check out the existing branch:

```bash
git fetch origin
git checkout <existing-branch-name>
```

Then check for conflicts with the default branch:

```bash
DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
git merge-base --is-ancestor origin/$DEFAULT_BRANCH HEAD
```

If this check fails (exit code non-zero), the branch has diverged and there may be conflicts. Surface a clear error and stop:

```
ERROR: Branch '<existing-branch-name>' has conflicts with '$DEFAULT_BRANCH'.
Please resolve the conflicts manually before resuming this task.
```

If no conflicts are detected, continue from Step 4 (skip Step 3, as the branch name is already recorded).

**Case B — No branch label found:**

Create a new branch. Branch name is generated from task ID and title (example: `feat/42-add-login-page`).

```bash
git checkout -b <branch-name>
```

Then continue to Step 3.

### 3. Write Branch Name to Task

```bash
# First, retrieve the existing body
agkan task get <id> --json
# Then update by concatenating existing body with branch name
agkan task update <id> body "<existing body>\n\nBranch: <branch-name>"
```

### 4. Implementation

Implement according to the task content.

Refer to /key-guidelines during implementation to maintain code quality.

### 5. Commit and Push

Stage files by specifying them explicitly. Do not use `git add -A` as it risks including unintended files such as `.env` or credentials.

```bash
git add <file1> <file2> ...
git commit -m "<commit message>"
git push -u origin <branch-name>
```

> **Note**: Do not use `git add -A` or `git add .`. Files containing `.env`, `credentials.*`, or secrets may be committed unintentionally.

### 6. Create PR

If a `PR:` label was found in the task body (Step 2, Case A), skip PR creation — the existing PR will be updated automatically when commits are pushed to the branch.

Otherwise, create a new PR:

```bash
gh pr create --title "<title>" --body "<body>"
```

### 7. Add PR Information to Task

If a `PR:` label was already present in the task body (Step 2, Case A), skip this step.

Otherwise, record the newly created PR URL:

```bash
# First, retrieve the existing body
agkan task get <id> --json
# Then update by concatenating existing body with PR URL
agkan task update <id> body "<existing body>\n\nPR: <PR URL>"
```

### 8. Update Task to Review

This step is **mandatory** and must always be executed, even if earlier steps had issues.

```bash
agkan task update <id> status review
```

Confirm the update succeeded:

```bash
agkan task get <id> --json
```

Verify that the status is `review`. If it is still `in_progress`, retry the update command.

---

## Important Notes

- Do not mark task as done before PR is merged (mark as done after PR review and merge)
- **Step 7 (status → review) must always be executed without fail** — this is the most critical step
- This skill is used after task selection (task selection is done with `agkan-run` skill)
