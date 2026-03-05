---
name: execute-subtask-direct
description: Use when a task has been selected and you need to implement it directly without PR/branch creation - handles implementation and marking done.
user-invokable: false
---

# execute-subtask-direct

## Overview

A workflow to directly implement a selected task without creating a branch or PR and mark it as complete.

---

## Workflow

### 1. Implementation

Implement according to the task requirements.

Refer to /key-guidelines during implementation to maintain code quality.

### 2. Commit

Commit the changes.

```bash
git add <files>
git commit -m "<commit message>"
```

### 3. Update task to done

```bash
agkan task update <id> status done
```

---

## Important Notes

- Do not create a branch (work directly on the current branch)
- Do not create a PR
- Update directly to done after implementation is complete
- This skill is used after task selection (task selection is done with the `execute-task-direct` skill)
