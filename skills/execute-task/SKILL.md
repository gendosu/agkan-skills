---
name: execute-task
description: Use when starting a development session to pick the highest priority Todo task from agkan, implement it, create a pull request, and mark it done.
---

# execute-task

## Overview

Standard workflow to pick the highest priority ready task from agkan, implement it, create a pull request, and complete it.

---

## Workflow

### 1. Update branch to latest

```bash
git checkout main && git pull -p
```

### 2. Get ready tasks

```bash
agkan task list --status ready --json
```

### 3. Select the highest priority task

Evaluate tasks in descending order using the following criteria and select the top one:

**Priority (get with `agkan task meta get <id> priority`):**
```
High > Medium > Low
```

**Tags (refer to when priority is the same):**
```
bug > security > improvement > test > performance > refactor > docs
```

**If there are child tasks or blocker tasks**
Prioritize the target child tasks or blocker tasks (same importance and tag criteria apply)

### 4. Check for blockers

```bash
agkan task block list <id> --json
```

`blockedBy` に未完了タスクが存在する場合は、そのタスクを選択せず別のタスクを選択するか、ブロッカータスクを先に処理する。

### 5. Update task to in_progress

```bash
agkan task update <id> status in_progress
```

### 6. Implement, create PR, complete

**Use the Task tool (general-purpose sub-agent)** to implement.
Do not use `Skill("execute-subtask")`, instead call the sub-agent by loading SKILL.md:

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

## Steps
Read .claude/skills/execute-subtask/SKILL.md and follow its steps to implement.
"""
)
```

### 7. End session or repeat

If there are no termination instructions from the user, select the next task and repeat from step 1 of the workflow.

---

## Priority Determination Flow

```
Todo task list
    ↓
Sort by priority (High → Medium → Low)
    ↓
Multiple tasks with same priority?
   Yes → Sort by tag priority (bug → security → ... → docs)
   No  → Select top task
    ↓
Select 1 task and start work
```

---

## Tag Priority List

| Priority | Tag Name |
|----------|----------|
| 1 | bug |
| 2 | security |
| 3 | improvement |
| 4 | test |
| 5 | performance |
| 6 | refactor |
| 7 | docs |

---

## Notes

- Always select only 1 task (do not start multiple tasks simultaneously)
- If no tasks exist, end the session
- Do not mark task as done before PR merge (mark as done after PR review and merge)
