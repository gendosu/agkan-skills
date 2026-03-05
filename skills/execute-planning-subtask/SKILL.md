---
name: execute-planning-subtask
description: Use when reviewing a single backlog task to assess decomposition, implementation readiness, and priority ordering.
user-invokable: false
---

# execute-planning-subtask

## Overview

A sub-workflow that reviews a single Backlog task in agkan, makes decisions on decomposition, Ready status movement, and deferral.

---

## Workflow

### 1. Content Review, Supplementation, and Task List Creation

- If task content is unclear, investigate and confirm details by examining the code
- Append the investigated content to the task description:

```bash
agkan task update <id> body "<additional content>"
```

- If the task contains multiple pieces of work, organize the content and append it to the description in task list format:

When creating a task list, it is advisable to use the Explore skill to examine the code, understand the task content, and then use Plan mode to create the task list if investigation is needed.

```- Task content summary
- [ ] Work item 1
- [ ] Work item 2
- [ ] Work item 3
```

### 2. Task Decomposition Decision

**Decomposition Granularity Standard: 1 Task = 1 PR = 1 Feature (Modification)**

- Decompose so that when a PR is merged, that feature or modification is complete
- Do not divide tasks such that a PR merge results in an incomplete state
- Only split when multiple independent features or modifications are mixed in a single task

If a task contains scope exceeding the above standard, split it into sub-tasks:

```bash
# Create new tasks after splitting
agkan task add "<sub-task name>" "<details>"

# Close the original task as split (or update it)
agkan task update <id> status closed
```

### 3. Ready Status Movement Decision

Move to Ready if **all** of the following conditions are met:

- No blockers (dependent tasks are completed)
- Scope that can be implemented as a single PR
- Implementation approach is clear

```bash
agkan task update <id> status ready
```

### 4. Deferral Decision

For tasks that are "something to do later but not now," attach the `will-do-later` tag and keep it in Backlog:

```bash
# Create the tag if it does not exist
agkan tag add "will-do-later"
# Attach the tag to the task
agkan tag attach <task-id> <tag-id>
```

Deferral criteria:
- Low impact on current priorities
- Dependent tasks are not yet completed
- Resources or information are insufficient

---

## Tag Priority

When attaching tags to tasks, use the following priority order:

| Priority | Tag Name |
|----------|-------------|
| 1 | bug |
| 2 | security |
| 3 | improvement |
| 4 | test |
| 5 | performance |
| 6 | refactor |
| 7 | docs |

Tag attachment command:

```bash
# Create the tag if it does not exist
agkan tag add "<tag>"
# Attach the tag to the task
agkan tag attach <task-id> <tag-id>
```

---

## Notes

- When decomposing tasks, inherit the content of the original task
- Move to Ready only for tasks that can be "started immediately"
- This skill is used after task selection (task selection is done by the `execute-planning` skill)
