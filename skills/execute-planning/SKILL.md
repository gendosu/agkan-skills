---
name: execute-planning
description: Use when reviewing backlog tasks to assess decomposition, implementation readiness, and priority ordering before development begins.
---

# execute-planning

## Overview

A planning workflow that uses agkan to review backlog tasks and make decisions about decomposition, moving to Ready status, and deferring tasks.

---

## Workflow

### 1. Retrieve Backlog Tasks

```bash
agkan task list --status backlog --json
```

### 2. Review Tasks One by One with Sub-agents

For each task, use the **Task tool (general-purpose sub-agent)** to review.
Do not use `Skill("execute-planning-subtask")`. Instead, invoke it by having the sub-agent read the SKILL.md file:

Or, if a task ID is specified, review only that target task.

```
Task(
  subagent_type="general-purpose",
  description="Review task #<id>",
  prompt="""
Please review the following backlog task.

## Task Information
- ID: <id>
- Title: <title>
- Body: <body>

## Procedure
Read .claude/skills/execute-planning-subtask/SKILL.md and follow its procedures to review.
"""
)
```

### 3. End Session or Continue

Repeat until all tasks are processed. If there is no end instruction from the user, select the next task and repeat from step 2.

---

## Decision Flow

```
Retrieve backlog tasks
    ↓
Delegate one task to sub-agent
    ↓
Sub-agent reviews and makes decision
  - Content unclear? → Research code → Add to task
  - Can be decomposed? → Split into subtasks → Close original task
  - Ready to implement now? → Move to Ready
  - Otherwise → Add "someday" tag and keep in Backlog
    ↓
Move to next task (repeat until all are done)
```

---

## Tag Priority

When tagging tasks, use the following priority order:

| Priority | Tag Name |
|--------|-------------|
| 1 | bug |
| 2 | security |
| 3 | improvement |
| 4 | test |
| 5 | performance |
| 6 | refactor |
| 7 | docs |

---

## Important Notes

- Tasks with the "someday" tag should be reconsidered after all Ready tasks are completed
- When decomposing tasks, inherit the content from the original task
- Only move to Ready tasks that are "ready to start immediately"
