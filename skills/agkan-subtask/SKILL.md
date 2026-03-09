---
name: agkan-subtask
description: Use when a task has been selected and you need to implement it in an isolated (forked) context - handles in_progress update, branch creation, implementation, PR creation, and marking done.
user-invokable: false
metadata:
  context: fork
---

# agkan-subtask

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

変更ファイルを明示的に指定してステージングする。`git add -A` は `.env` や credentials など意図しないファイルが含まれるリスクがあるため使用しない。

```bash
git add <file1> <file2> ...
git commit -m "<commit message>"
git push -u origin <branch-name>
```

> **注意**: `git add -A` や `git add .` は使用しないこと。`.env`、`credentials.*`、秘密情報を含むファイルが意図せずコミットされる可能性がある。

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
- This skill is used after task selection (task selection is done with `agkan-run` skill)
