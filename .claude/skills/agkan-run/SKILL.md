---
name: agkan-run
description: Use when starting a development session to pick the highest priority Todo task from agkan, implement it, create a pull request, and mark it done.
---

# agkan-run

## Overview

Standard workflow to pick the highest priority ready task from agkan, implement it, create a pull request, and complete it.

---

## Workflow

### 1. Update branch to latest

Before switching to main, check for uncommitted changes:

```bash
git status --porcelain
```

If there are uncommitted changes, stash them first:

```bash
git stash push -m "agkan-run: stash before switching to main"
```

Then update to latest:

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
Tasks with the `will-do-later` tag are intentionally postponed tasks, so skip them. Only select tasks that do not have the `will-do-later` tag.

**Priority (read from `metadata` field in the list JSON response):**
```
Critical > High > Medium > Low
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

If there are incomplete tasks in `blockedBy`, do not select that task. Instead, select a different task or process the blocker task first.

### 5. Update task to in_progress

```bash
agkan task update <id> status in_progress
```

### 6. Implement, create PR, complete

**Use the Task tool (general-purpose sub-agent)** to implement.
Do not use `Skill("agkan-subtask")`; instead, instruct the sub-agent to read the SKILL.md file directly.

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
Read .claude/skills/agkan-subtask/SKILL.md and follow its steps to implement.
"""
)
```

### 7. Verify task status after sub-agent completes

After the sub-agent completes, check whether the task has been moved out of `in_progress`. If it is still `in_progress`, move it to `review` (since a PR was created):

```bash
agkan task get <id> --json
```

If the status is still `in_progress`, update it:

```bash
agkan task update <id> status review
```

### 8. Re-fetch task list and continue or end session

After confirming the task status, re-fetch the task list to pick up any newly added ready tasks:

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
Sort by priority (Critical → High → Medium → Low)
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
