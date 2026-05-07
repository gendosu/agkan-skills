---
name: agkan-subtask-direct
description: Use when a task has been selected and you need to implement it directly without PR/branch creation - handles in_progress update, implementation, and marking done.
user-invokable: false
---

# agkan-subtask-direct

## Overview

A workflow to directly implement a selected task without creating a branch or PR and mark it as complete.

---

## Workflow

### 1. Update Task to In Progress

```bash
agkan task update <id> status in_progress
```

### 2. Check for Pre-assigned Branch

Before implementing, check if a branch has been pre-assigned via task metadata:

```bash
BRANCH=$(agkan task meta get <id> branch 2>/dev/null)
if [ -n "$BRANCH" ]; then
  git fetch origin
  git checkout "$BRANCH"
fi
```

If `$BRANCH` is set, all subsequent commits and pushes must target that branch.

### 3. Implementation

Implement according to the task requirements.

Refer to /key-guidelines during implementation to maintain code quality.

### 4. Static Analysis / Lint Check (if applicable)

If the project has a static analysis or lint tool configured, run it before committing:

- TypeScript: `npx tsc --noEmit`
- ESLint: `npx eslint .`
- RuboCop: `bundle exec rubocop`
- Ruff (Python): `ruff check .`
- Other: run the appropriate tool for the project language

Fix any errors before proceeding.

### 5. Commit

> **MANDATORY**: Committing and pushing the implementation is required and MUST NOT be skipped. This step must complete before advancing to Steps 6 and 7. Skipping commit for any reason — including when approaching context limits or after running tests/lint — is forbidden.

Stage files by specifying them explicitly. Do not use `git add -A` as it risks including unintended files such as `.env` or credentials.

```bash
git add <file1> <file2> ...
git commit -m "<commit message>"
# If a branch was checked out from metadata, push to it; otherwise push to current branch
git push -u origin <branch-name-or-current>
```

> **Note**: Do not use `git add -A` or `git add .`. Files containing `.env`, `credentials.*`, or secrets may be committed unintentionally.

**After push, verify it succeeded before proceeding to Step 6:**

```bash
git ls-remote --heads origin <branch-name-or-current>
```

If push failed (empty output or non-zero exit code), record the error in the task body and do NOT proceed to Step 6. Leave the task as `in_progress`.

**Recovery: If interrupted during Steps 3–5**

If an error, permission denial, or user interruption occurs during implementation (Step 3), lint check (Step 4), or commit/push (Step 5):
1. Do NOT update the task status to `done`
2. Record what happened in the task body
3. Leave the task as `in_progress` — complete the remaining steps before re-evaluating

### 6. Self-Review

Before updating the task status, perform a self-review of the implementation using the `superpowers:code-reviewer` sub-agent:

```
Agent(
  subagent_type="superpowers:code-reviewer",
  description="Self-review task #<id> implementation",
  prompt="""Review the implementation of the following task.

Task #<id>: <title>

Task body:
<body>

Review the git changes (run `git diff HEAD~1 HEAD` to see them) against the original plan and coding standards. Check for correctness, security issues, and code quality. Report critical issues that must be fixed before completing the task.
"""
)
```

If the code reviewer identifies critical issues, fix them and commit the fixes before proceeding.

### 7. Update task to done

Only execute this step if implementation succeeded — specifically, if ALL of the following conditions are met:

> **Scope note**: The interruption guard below applies **only to this status
> transition decision** — not to Steps 3–5. If a confirmation or interruption
> occurred during implementation and has since been resolved, complete Steps 3–5
> before evaluating the guard below.

**Implementation succeeded** means ALL of the following:
- At least one `git commit` was executed in this session (verify with `git log --oneline -1`)
- Actual code/file changes were committed (not just task management operations)
- `git push` completed without errors

**The following do NOT count as implementation:**
- `agkan task comment add` (comment additions only)
- `agkan task update --body` / `--file` (body/metadata updates only)
- Discussion or planning without code changes

**Before updating to done, verify a commit was made:**

```bash
git log --oneline -1
```

If no commits were made in this session (output is empty or only shows pre-existing commits), do NOT update the status to done. **Surface the failure** by appending an error line to the task body, then leave the task as `in_progress`:

```bash
# Surface silent failure: no commit was made
agkan task get <id> --json
# Write body to tmp file and update using --file to preserve newlines
cat > /tmp/agkan_body_$$.md << 'BODY'
<existing body>

Error: Skill reached end without a commit. Implementation was not completed — files may remain uncommitted in the working tree. Manual intervention required.
BODY
agkan task update <id> --file /tmp/agkan_body_$$.md
# Do NOT run: agkan task update <id> status done
```

**If a critical error occurred** (e.g., git push failed, permission denied, commit failed), do NOT update the status to done. Leave the task as `in_progress` and record the error details in the task body:

```bash
# On error: record what went wrong in the task body (optional but recommended)
agkan task get <id> --json
# Write body to tmp file and update using --file to preserve newlines
cat > /tmp/agkan_body_$$.md << 'BODY'
<existing body>

Error: <error description>
BODY
agkan task update <id> --file /tmp/agkan_body_$$.md
# Do NOT run: agkan task update <id> status done
```

**If only task management operations were performed** (comments, body updates, no commits), do NOT update the status to done. Leave the task as `in_progress`.

**If implementation succeeded** (commits were made and pushed), update to done:

```bash
agkan task update <id> status done
```

---

## Important Notes

- Do not create a branch (work directly on the current branch)
- Do not create a PR
- **Only update to done if implementation succeeded** — if a critical error occurred, keep the task as `in_progress`
- **Only update to done if at least one `git commit` was made** — task management operations alone (comments, body updates) do NOT qualify as implementation
- If a critical error occurs (git push failure, commit failure, permission error), keep the task as `in_progress` and record the error
- If only task management operations were performed (no commits), keep the task as `in_progress`
- This skill is used after task selection (task selection is done with the `agkan-run-direct` skill)
