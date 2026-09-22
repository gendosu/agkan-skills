---
name: agkan-icebox
description: Use when reviewing icebox tasks to decide whether to promote them to backlog or close them as no longer needed.
---

# agkan-icebox

## Overview

A workflow to review `icebox` tasks and decide whether to promote each one to `backlog` or close it.

**Icebox definition:** Tasks that are ideas or candidates not yet ready for planning. They have unclear requirements, are on hold pending external factors, or are low-priority items that may be addressed in the future.

---

## When to Run

- When icebox tasks have accumulated and need periodic review
- When external conditions change and previously deferred tasks may now be relevant
- When starting a new planning cycle and wanting to surface hidden candidates

---

## Agent Compatibility

Use the executing environment's available tools; these procedures apply across agents.
`Delegate(...)` below is pseudocode, not a tool name: map it to the available
sub-agent tool and supported arguments, using the indicated role and prompt. Wait
for completion before continuing. If delegation is unavailable or disallowed,
execute the same procedure in the current agent, preserving its scope and status checks.
An empty model means inherit the current model (omit the model override). Honor an
explicit model only when the environment supports it; never silently substitute a
different model. Check this before changing task status; if unsupported, report the
limitation and stop unless a later step defines a skip/recovery procedure.
Pass effort through a supported setting, or retain it as prompt-level thoroughness
guidance without claiming the runtime effort was changed.
Resolve referenced skills from the environment's skill catalog or this installation's
sibling directories. Pass a resolved accessible path or embed their instructions in
the sub-agent prompt; do not assume a `.claude/skills` installation.

## Workflow

### 0. Fetch Config

```bash
CONFIG=$(agkan config get --json 2>/dev/null || echo '{}')
ICEBOX_MODEL=$(echo "$CONFIG" | jq -r '.config.models.icebox.model // empty')
ICEBOX_EFFORT=$(echo "$CONFIG" | jq -r '.config.models.icebox.effort // "high"')
```

### 1. Retrieve Icebox Tasks

```bash
agkan task list --status icebox --json
```

### 2. Review Tasks One by One with Sub-agents

For each task, use the **available sub-agent tool (general-purpose role)** to review.
Resolve the agkan-icebox-subtask skill and pass its accessible SKILL.md path (or embed its content) in the prompt:

```
Delegate(
  role="general-purpose",
  model="<ICEBOX_MODEL>",
  description="Review icebox task #<id>",
  prompt="""
Please review the following icebox task.

## Task Information
- ID: <id>
- Title: <title>
- Body: <body>

## Procedure
Read <resolved-path-to-agkan-icebox-subtask-SKILL.md> and follow its procedures to review.

## Effort / Thoroughness
Effort level: <ICEBOX_EFFORT>
- low: Quick assessment. Focus on obvious gaps or blockers. Minimal research.
- medium: Standard review. Check requirements clarity and promote/close decision.
- high: Thorough review. Deep analysis of relevance, dependencies, and edge cases. Research codebase as needed.
- xhigh: Recommended default for planning/agentic work; maximize coverage of dependencies and edge cases.
- max: Reserve for the highest-stakes or most complex tasks.
"""
)
```

If a task ID is specified by the user, retrieve and review only that target task:

```bash
agkan task get <id> --json
```

Then delegate only that single task to a sub-agent using the same delegation procedure above.

### 3. Re-fetch Icebox Tasks and Continue or End Session

After the sub-agent completes, re-fetch the icebox task list to pick up any tasks added during processing:

```bash
agkan task list --status icebox --json
```

If there is no instruction to end from the user and icebox tasks remain, select the next task and repeat from step 2.

If no icebox tasks remain, end the session.

---

## Decision Flow

```
Retrieve icebox tasks
    ↓
Delegate one task to sub-agent
    ↓
Sub-agent reviews and makes decision
  - Requirements now clear? → Promote to backlog
  - No longer needed / superseded → Close
  - Still unclear / waiting → Keep in icebox
    ↓
Move to next task (repeat until all are done)
```

---

## Important Notes

- Icebox is not a permanent graveyard — review it periodically
- When promoting to backlog, the task will be picked up by `agkan-planning` next
- Do not move icebox tasks directly to `ready`; always go through `backlog` → planning first
