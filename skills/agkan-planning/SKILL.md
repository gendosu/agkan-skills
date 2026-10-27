---
name: agkan-planning
description: Use when reviewing backlog tasks to assess decomposition, implementation readiness, and priority ordering before development begins.
---

# agkan-planning

## Overview

A planning workflow that uses agkan to review backlog tasks and make decisions about decomposition, moving to Ready status, and deferring tasks.

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
PLANNING_MODEL=$(echo "$CONFIG" | jq -r '.config.models.planning.model // empty')
PLANNING_EFFORT=$(echo "$CONFIG" | jq -r '.config.models.planning.effort // "high"')
```

### 1. Retrieve Backlog Tasks

```bash
agkan task list --status backlog --json
```

### 2. Review Tasks One by One with Sub-agents

For each task, use the **available sub-agent tool (general-purpose role)** to review.
Resolve the agkan-planning-subtask skill before delegation and pass its accessible
SKILL.md path (or embed its content) in the prompt. Loading a skill in the parent
alone does not provide its instructions to a sub-agent.

```
Delegate(
  role="general-purpose",
  model="<PLANNING_MODEL>",
  description="Review task #<id>",
  prompt="""
Please review the following backlog task.

## Task Information
- ID: <id>
- Title: <title>
- Body: <body>

## Procedure
Read <resolved-path-to-agkan-planning-subtask-SKILL.md> and follow its procedures to review.

## Important Constraint
Your role is ONLY to review the task and update its status in agkan (e.g., move to ready, decompose, or tag for deferral).
Do NOT implement the task. Do NOT edit any source code or codebase files.
If a required user decision cannot be resolved from existing answers or investigation, return a Needs user input handoff with the task ID, findings, question, options, recommendation, and the point to resume. Do not classify an unanswered question as Deferral or change status, priority, or deferral tags while clarification is pending. The parent will ask the user and return the answer so this task's planning can continue.

## Effort / Thoroughness
Effort level: <PLANNING_EFFORT>
- low: Quick assessment. Focus on obvious gaps or blockers. Minimal research.
- medium: Standard review. Check requirements clarity, decomposition needs, and implementation readiness.
- high: Thorough review. Deep analysis of dependencies, edge cases, and potential risks. Research codebase as needed.
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

**Handle clarification before considering the review complete:**

- When the sub-agent reports **Needs user input**, ask the user immediately using the clarification procedure in `agkan-planning-subtask` Step 1. Also follow this path if a result reports Deferral solely because no answer has arrived; that is an incomplete review. An explicit user choice to postpone is a valid Deferral.
- The parent owns the user conversation. Present the question and options, not just a report that the task is waiting for an answer. Follow the available question tool's response behavior; if no suitable tool is usable, ask directly in conversation.
- After receiving the actual answer, resume the same sub-agent with it. If resuming is unavailable, delegate the same task again with the findings and answer, or continue it in the current agent. Reuse the investigation and record the answer in the task body.
- Do not advance to the next backlog task or end with a completed-planning report while this clarification is unanswered. An explicit user request to defer or stop is handled as such; silence is neither.

### 3. Re-fetch Backlog Tasks and Continue or End Session

After the task's review is complete, including any clarification and resumed planning from Step 2, re-fetch the backlog task list to pick up any changes (e.g., tasks added by decomposition):

```bash
agkan task list --status backlog --json
```

If there is no instruction to end from the user and backlog tasks remain, select the next task and repeat from step 2.

If no backlog tasks remain, end the session.

---

## Decision Flow

```
Retrieve backlog tasks
    ↓
Delegate one task to sub-agent
    ↓
Sub-agent reviews and makes decision
  - Content unclear? → Research code → Add to task
  - User decision needed? → Hand question to parent → Ask user → Resume same task with answer
  - Can be decomposed? → Split into subtasks → Close original task
  - Ready to implement now? → Move to Ready
  - Deferral criteria met? → Record reason → Add "will-do-later" tag and keep in Backlog
    ↓
Move to next task (repeat until all are done)
```

---

## Tag Priority

See the canonical definition in `agkan/SKILL.md` (Tag Priority section).

---

## Important Notes

- Tasks with the "will-do-later" tag should be reconsidered after all Ready tasks are completed
- When decomposing tasks, inherit the content from the original task
- Only move to Ready tasks that are "ready to start immediately"
- Icebox tasks are **not** handled by this skill — use `agkan-icebox` to review and promote icebox tasks to backlog first
