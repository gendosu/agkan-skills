---
name: execute-task-direct
description: Use when starting a development session to pick the highest priority Todo task from agkan, implement it directly without PR/branch, and mark it done.
---

# execute-task-direct

## Overview

A workflow to select the highest priority ready task from agkan, implement it directly without creating a branch or PR, and mark it as done.

---

## Workflow

### 1. Update Branch

```bash
git pull -p
```

### 2. Get Ready Tasks

```bash
agkan task list --status ready --json
```

### 3. Select One High-Priority Task

Evaluate tasks using the following criteria in descending order and select the top one:

**Skip tasks with `will-do-later` tag:**
`will-do-later` タグが付いているタスクは意図的に先送りされたタスクであるため、スキップする。`will-do-later` タグが付いていないタスクのみを選択対象とする。

**Priority (read from `metadata` field in the list JSON response):**
```
High > Medium > Low
```

**Tags (used when priority is the same):**
```
bug > security > improvement > test > performance > refactor > docs
```

**When there are subtasks or blocker tasks**
Prioritize the target subtasks or blocker tasks (using the same importance and tag criteria)

### 4. Check for Blockers

```bash
agkan task block list <id> --json
```

`blockedBy` に未完了タスクが存在する場合は、そのタスクを選択せず別のタスクを選択するか、ブロッカータスクを先に処理する。

### 5. Update Task Status to in_progress

```bash
agkan task update <id> status in_progress
```

### 6. Implementation and Completion

Use the **Task tool (general-purpose sub-agent)** to implement.
Do not use `Skill("execute-subtask-direct")`; instead, call it by having the sub-agent load the SKILL.md file:

```
Task(
  subagent_type="general-purpose",
  description="Implement task #<id>",
  prompt="""
Please implement the following task.

Invoke the key-guidelines skill using the Skill tool: Skill("key-guidelines")

## Task Information
- ID: <id>
- Title: <title>
- Body: <body>

## Procedure
Load .claude/skills/execute-subtask-direct/SKILL.md and follow its procedures to implement.
"""
)
```

### 7. End Session or Repeat

If there is no instruction to end from the user, select the next task and repeat from step 1 of the same workflow.

---

## Priority Determination Flow

```
Ready task list
    ↓
Sort by priority (High → Medium → Low)
    ↓
Multiple tasks with same priority?
   Yes → Sort by tag priority (bug → security → ... → docs)
   No  → Select the top task
    ↓
Select one task and start
```

---

## Tag Priority List

See the canonical definition in `agkan/SKILL.md` (Tag Priority section).

---

## Important Notes

- Always select only one task (do not work on multiple tasks simultaneously)
- If no tasks exist, end the session
- Do not create branches or PRs (commit directly to the current branch)
- Update the task status to done after implementation is complete
