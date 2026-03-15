---
name: agkan-add
description: Use when adding a new task to the backlog — collects title, body, tags, priority, and parent task, then creates it with agkan.
---

# agkan-add

## Overview

A workflow to add a new task to the backlog with all relevant fields set in one pass.

---

## When to Run

- When the user wants to register a new task or idea
- When a new requirement surfaces during development
- When creating a child task under an existing parent

---

## Workflow

### 1. Collect Task Information

Gather the following from the user. Fields marked optional can be skipped if not provided.

| Field | Required | Notes |
|-------|----------|-------|
| Title | Yes | Short, descriptive task title |
| Body | No | Detailed description, background, acceptance criteria |
| Tags | No | One or more from the canonical tag list (see below) |
| Priority | No | `critical` / `high` / `medium` / `low` (default: `medium`) |
| Parent task ID | No | ID of an existing task to nest this task under |

**Canonical tag list (in priority order):**

| Tag | Use when |
|-----|----------|
| `bug` | Something is broken |
| `security` | Security-related concern |
| `improvement` | Enhancement to existing functionality |
| `test` | Test coverage or QA |
| `performance` | Speed or resource optimization |
| `refactor` | Code quality, no behavior change |
| `docs` | Documentation |

### 2. Create the Task

```bash
agkan task add "<title>" "<body>" --priority <value>
```

If no body is provided:

```bash
agkan task add "<title>" --priority <value>
```

If priority is `medium` (the default), the `--priority` flag can be omitted:

```bash
agkan task add "<title>" "<body>"
agkan task add "<title>"
```

**When including line breaks in body, use the `$'...'` syntax.**

Using `\n` within regular double quotes will pass it as a literal `\n` string and will not create a line break.

```bash
# NG: \n is passed as a literal string
agkan task add "タイトル" "1行目\n2行目"

# OK: Using $'...' syntax expands \n as an actual line break
agkan task add "タイトル" $'1行目\n2行目\n\n## 詳細\n内容はここに'
```

Note the task ID returned from the command output.

### 3. Attach Tags (if any)

For each tag:

```bash
agkan tag attach <task-id> <tag-name>
```

### 4. Set Parent Task (if applicable)

```bash
agkan task update-parent <task-id> <parent-id>
```

### 5. Show Summary

Retrieve and display the created task:

```bash
agkan task get <task-id>
```

Output a concise summary to the user:

- ID and title
- Status (should be `backlog`)
- Tags attached
- Priority
- Parent task (if set)

---

## Important Notes

- Tasks are always created with `backlog` status by default
- Do not move to `ready` — that is handled by `agkan-planning`
- If the user provides a parent ID, verify it exists before setting the relationship
- When in doubt about tags, ask the user rather than guessing
