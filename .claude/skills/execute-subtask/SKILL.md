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

Workflow to implement a selected task on a new branch, create a PR, and complete the task.

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

```bash
agkan task update <id> status review
```

---

## Important Notes

- Do not mark task as done before PR is merged (mark as done after PR review and merge)
- This skill is used after task selection (task selection is done with `execute-task` skill)
