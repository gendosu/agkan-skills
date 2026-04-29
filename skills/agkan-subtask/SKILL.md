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

Before creating a new branch, check for an existing branch in two places:

1. **Task metadata** (primary source):

```bash
BRANCH=$(agkan task meta get <id> branch 2>/dev/null)
```

2. **Task body** (fallback — only if metadata is empty):

```bash
agkan task get <id> --json
```

Parse the task body for the following labels:

```
Branch: <branch-name>
PR: <URL>
```

If `$BRANCH` from metadata is empty, parse the body for `Branch: <branch-name>` and use that value.

**Case A — Branch found (via metadata or body label):**

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
DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
git fetch origin
git checkout -b <branch-name> origin/$DEFAULT_BRANCH
```

Then continue to Step 3.

### 3. Write Branch Name to Task

```bash
# First, retrieve the existing body
agkan task get <id> --json
# Then update by concatenating existing body with branch name
agkan task update <id> body "<existing body>\n\nBranch: <branch-name>"
# Also store as metadata so the board detail panel can display it
agkan task meta set <id> branch <branch-name>
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
# Also store as metadata so the board detail panel can display it
agkan task meta set <id> pr <PR URL>
```

### 8. Self-Review

Before updating the task status, perform a self-review of the implementation using the `superpowers:code-reviewer` sub-agent:

```
Agent(
  subagent_type="superpowers:code-reviewer",
  description="Self-review task #<id> implementation",
  prompt="""Review the implementation of the following task.

Task #<id>: <title>

Task body:
<body>

Review the git changes (run `git diff origin/<default-branch>...HEAD` to see them) against the original plan and coding standards. Check for correctness, security issues, and code quality. Report critical issues that must be fixed before completing the task.
"""
)
```

If the code reviewer identifies critical issues, fix them, commit and push the fixes, before proceeding.

### 9. Update Task to Review

Only execute this step if implementation succeeded — specifically, if ALL of the following conditions are met:

**Implementation succeeded** means ALL of the following:
- At least one `git commit` was executed in this session
- Actual code/file changes were committed (not just task management operations)
- `git push` completed without errors
- PR was created or already exists
- No pending user confirmations or interruptions remain

**The following do NOT count as implementation:**
- `agkan task comment add` (comment additions only)
- `agkan task update --body` / `--file` (body/metadata updates only)
- Discussion or planning without code commits

**If a critical error occurred** (e.g., git push failed, PR creation failed, permission denied), do NOT update the status to review. Leave the task as `in_progress` and record the error details in the task body:

```bash
# On error: record what went wrong in the task body (optional but recommended)
agkan task get <id> --json
agkan task update <id> body "<existing body>\n\nError: <error description>"
# Do NOT run: agkan task update <id> status review
```

**If user confirmation was required / execution was interrupted mid-task** (e.g., permission denied for a file edit, user asked a clarifying question, tool use was blocked, or the skill presented choices to the user), do NOT update the status to `review`. Leave the task as `in_progress`:

```bash
# When interrupted awaiting user input: do NOT advance to review
# The task remains in_progress until fully implemented after confirmation
# Do NOT run: agkan task update <id> status review
```

`review` status means implementation is **fully complete** — a PR has been successfully created and is awaiting human review. It does **not** mean "paused waiting for user input".

**If implementation succeeded**, update to review:

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
- **Step 9 (status → review) must only be executed when implementation succeeded** — do not update to review if a critical error occurred
- **Step 9 (status → review) requires at least one `git commit` to have been made** — task management operations alone (comments, body updates) do NOT qualify as implementation
- If a critical error occurs (git push failure, PR creation failure, permission error), keep the task as `in_progress` and record the error
- **If user confirmation was required or execution was interrupted mid-task**, keep the task as `in_progress` — do NOT advance to `review`
- `review` status is exclusively for tasks where implementation is fully complete and a PR is awaiting human review
- This skill is used after task selection (task selection is done with `agkan-run` skill)
