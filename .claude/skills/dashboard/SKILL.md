---
name: dashboard
description: Use when checking overall task status and project health - shows counts by status, in-progress tasks, and high-priority ready tasks
---

# dashboard

## Overview

Workflow to get a quick overview of project health by checking task counts by status, current in-progress tasks, and high-priority ready tasks.

---

## Workflow

### 1. Get task counts by status

```bash
agkan task count --json
```

Display a summary table of all statuses:

| Status | Count |
|--------|-------|
| icebox | N |
| backlog | N |
| ready | N |
| in_progress | N |
| review | N |
| done | N |
| closed | N |
| **total** | **N** |

### 2. Show in-progress tasks

```bash
agkan task list --status in_progress --json
```

Display each in-progress task with its ID, title, and priority (from metadata).

### 3. Show high-priority ready tasks

```bash
agkan task list --status ready --json
```

Filter and display tasks where `metadata` contains `priority: critical` or `priority: high`.

Display each task with its ID, title, and priority value.

---

## Output Format

Present the dashboard in the following order:

1. **Status Counts** — table showing counts for all statuses
2. **In Progress** (`in_progress`) — list of tasks currently being worked on
3. **High Priority Ready** (`ready` with `critical` or `high` priority) — tasks ready to start with high urgency

Example output:

```
## Task Dashboard

### Status Counts
| Status     | Count |
|------------|-------|
| icebox     | 2     |
| backlog    | 5     |
| ready      | 3     |
| in_progress| 1     |
| review     | 0     |
| done       | 12    |
| closed     | 4     |
| **total**  | **27**|

### In Progress
- #5 Implement login feature

### High Priority Ready
- #3 Fix critical bug in payment flow [critical]
- #7 Update authentication library [high]
```

---

## Notes

- Priority is stored as task metadata with key `priority`
- Priority values: `critical` > `high` > `medium` > `low`
- If there are no in-progress tasks or no high-priority ready tasks, display a message indicating none exist
- This skill is read-only and does not modify any tasks
