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

Read the branch from the task's first-class `branch` column:

```bash
TASK_JSON=$(agkan task get <id> --json)
BRANCH=$(echo "$TASK_JSON" | jq -r '.task.branch // empty')
```

Also parse the task body for a `PR:` label:

```
PR: <URL>
```

**Case A — Branch is non-null:**

Check out the existing branch:

```bash
git fetch origin
git checkout "$BRANCH"
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

If no conflicts are detected, continue from Step 4 (skip Step 3, as the branch is already recorded in the task).

**Case B — Branch is null:**

Generate a branch name from the task ID and title. Use the following naming convention:

- If the task has a `bug` or `security` tag → prefix `fix/`
- Otherwise → prefix `feat/`
- Format: `<prefix>/<id>-<title-slug>` (e.g., `feat/42-add-login-page`)

```bash
DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
git fetch origin
git checkout -b <branch-name> origin/$DEFAULT_BRANCH
```

Then continue to Step 3.

### 3. Write Branch Name to Task

```bash
agkan task update <id> --branch <branch-name>
```

This stores the branch as a first-class column on the task record so subsequent skill executions can resume work on the correct branch.

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

**After push, verify it succeeded before proceeding to Step 6:**

```bash
git ls-remote --heads origin <branch-name>
```

If push failed (empty output or non-zero exit code), record the error in the task body and do NOT proceed to PR creation. Leave the task as `in_progress`.

**Recovery: If interrupted during Steps 4–7**

If an error, permission denial, or user interruption occurs during implementation (Step 4), commit/push (Step 5), or PR creation (Step 6):
1. Do NOT update the task status to `review`
2. Record what happened in the task body
3. Leave the task as `in_progress` — complete the remaining steps before re-evaluating

### 6. Create PR

> **MANDATORY**: PR creation after a successful push is required and MUST NOT be
> skipped. This step must complete before advancing to Steps 7 and 9. Skipping PR
> creation for any reason other than an existing `PR:` label (Case A below) is
> forbidden — including when approaching context limits.

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

### 8. Update Checkboxes

If the task body contains `- [ ]` checklist items, update items completed during this implementation.

1. Retrieve the current body:

```bash
TASK_JSON=$(agkan task get <id> --json)
CURRENT_BODY=$(echo "$TASK_JSON" | jq -r '.task.body // empty')
```

2. Check whether the body contains unchecked items. If none found, **skip this step**:

```bash
echo "$CURRENT_BODY" | grep -q -- '- \[ \]' || echo "No unchecked items — skipping"
```

3. For each item completed in this implementation, replace its `- [ ]` with `- [x]`. Write the updated body to a temp file and apply:

```bash
cat > /tmp/agkan_checkbox_$$.md << 'BODY'
<updated body with completed items marked as - [x]>
BODY
agkan task update <id> --file /tmp/agkan_checkbox_$$.md
```

> Only mark items that were actually completed in this session. Leave pending items as `- [ ]`.

### 9. Self-Review

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

### 10. Update Task to Review

Only execute this step if implementation succeeded — specifically, if ALL of the following conditions are met:

**Implementation succeeded** means ALL of the following:
- At least one `git commit` was executed in this session
- Actual code/file changes were committed (not just task management operations)
- `git push` completed without errors
- PR was created or already exists

> **Scope note**: The interruption guard below applies **only to this status
> transition decision** — not to Steps 4–8. If a confirmation or interruption
> occurred during implementation and has since been resolved, complete Steps 5–7
> before evaluating the guard below.

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

**If an unresolved interruption remains at this point** (e.g., push or PR creation in Steps 5–7 could not complete, a tool use is still blocked, or the skill is still awaiting user clarification), do NOT update the status to `review`. Leave the task as `in_progress`:

```bash
# When an unresolved interruption prevents completion: do NOT advance to review
# Resolve the interruption, complete Steps 5–7, then re-evaluate
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
- **Step 10 (status → review) must only be executed when implementation succeeded** — do not update to review if a critical error occurred
- **Step 10 (status → review) requires at least one `git commit` to have been made** — task management operations alone (comments, body updates) do NOT qualify as implementation
- If a critical error occurs (git push failure, PR creation failure, permission error), keep the task as `in_progress` and record the error
- **If user confirmation was required or execution was interrupted mid-task**, keep the task as `in_progress` — do NOT advance to `review`
- `review` status is exclusively for tasks where implementation is fully complete and a PR is awaiting human review
- This skill is used after task selection (task selection is done with `agkan-run` skill)
