---
name: execute-icebox
description: Use when reviewing icebox tasks to decide whether to promote them to backlog or close them as no longer needed.
---

# execute-icebox

## Overview

A workflow to review `icebox` tasks and decide whether to promote each one to `backlog` or close it.

**Icebox definition:** Tasks that are ideas or candidates not yet ready for planning. They have unclear requirements, are on hold pending external factors, or are low-priority items that may be addressed in the future.

---

## When to Run

- When icebox tasks have accumulated and need periodic review
- When external conditions change and previously deferred tasks may now be relevant
- When starting a new planning cycle and wanting to surface hidden candidates

---

## Workflow

### 1. Retrieve Icebox Tasks

```bash
agkan task list --status icebox --json
```

### 2. Review Tasks One by One

For each icebox task, evaluate it against the following criteria:

**Promote to backlog (`backlog`) when:**
- The requirement or background is now clear enough to plan
- External blockers have been resolved
- The task has become relevant due to changed circumstances

**Close (`closed`) when:**
- The need no longer exists
- A duplicate task already exists in backlog or later stages
- It was superseded by another approach or decision

**Keep in icebox when:**
- Still waiting on external factors
- Not enough information to decide yet (leave as-is)

### 3. Update Status

```bash
# Promote to backlog
agkan task update <id> status backlog

# Close as no longer needed
agkan task update <id> status closed
```

### 4. Add Notes (Optional)

If the reason for the decision is non-obvious, add context to the task body before updating status:

```bash
agkan task update <id> body "<updated body with reason>"
```

---

## Decision Flow

```
Retrieve icebox tasks
    ↓
Review each task one by one
    ↓
Is the task actionable now?
  - Yes, requirements are clear → Promote to backlog
  - No longer needed / superseded → Close
  - Still unclear / waiting → Keep in icebox
    ↓
Repeat until all icebox tasks are reviewed
```

---

## Important Notes

- Icebox is not a permanent graveyard — review it periodically
- When promoting to backlog, the task will be picked up by `execute-planning` next
- Do not move icebox tasks directly to `ready`; always go through `backlog` → planning first
