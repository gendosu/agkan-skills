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

### 2. Create Branch

```bash
git checkout -b <branch-name>
```

Branch name is generated from task ID and title (example: `feat/42-add-login-page`).

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

```bash
gh pr create --title "<title>" --body "<body>"
```

### 7. Add PR Information to Task

```bash
# First, retrieve the existing body
agkan task get <id> --json
# Then update by concatenating existing body with PR URL
agkan task update <id> body "<existing body>\n\nPR: <PR URL>"
```

### 8. Update Task to Review

```bash
agkan task update <id> status review
```

---

## Important Notes

- Do not mark task as done before PR is merged (mark as done after PR review and merge)
- This skill is used after task selection (task selection is done with `agkan-run` skill)
