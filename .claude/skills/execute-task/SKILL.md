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

**Skip tasks with `will-do-later` tag:**
`will-do-later` タグが付いているタスクは意図的に先送りされたタスクであるため、スキップする。`will-do-later` タグが付いていないタスクのみを選択対象とする。

**Priority (read from `metadata` field in the list JSON response):**
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
Do not use `Skill("execute-subtask")`; instead, instruct the sub-agent to read the SKILL.md file directly.

> **Why SKILL.md path instead of `Skill()`?**
> Sub-agents spawned via the Task tool start with a fresh context. `Skill()` loads skill content into the current conversation, but a sub-agent needs its instructions embedded in its prompt. Providing the SKILL.md path directly in the prompt is the reliable way to pass workflow instructions to a sub-agent.

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

### 7. Re-fetch task list and continue or end session

After the sub-agent completes, re-fetch the task list to pick up any newly added ready tasks:

```bash
agkan task list --status ready --json
```

If there are no termination instructions from the user and ready tasks exist (including newly added ones), select the next task and repeat from step 3 of the workflow.

If no ready tasks remain, end the session.

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

See the canonical definition in `agkan/SKILL.md` (Tag Priority section).

---

## Notes

- Always select only 1 task (do not start multiple tasks simultaneously)
- If no tasks exist, end the session
- Do not mark task as done before PR merge (mark as done after PR review and merge)
