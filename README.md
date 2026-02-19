# agkan-skills

A comprehensive skill collection for task management workflows using the agkan CLI tool with Claude Code.

## Overview

The agkan-skills plugin provides four powerful skills for managing development workflows with agkan, a SQLite-based task management tool optimized for AI agent collaboration. These skills enable efficient task planning, execution, and progress tracking through a structured kanban workflow.

## Features

- **Task Management**: Create, list, update, and organize tasks with hierarchical relationships
- **Planning Workflows**: Review and assess backlog tasks for decomposition and readiness
- **Task Execution**: Pick priority tasks, implement them, and create pull requests
- **Blocking Relationships**: Define task dependencies and blocking relationships
- **Metadata Support**: Attach priority levels and custom metadata to tasks
- **JSON Output**: Machine-readable output for programmatic task processing

## Skills

### 1. agkan

The core skill for managing tasks using the agkan CLI tool.

**Use Cases:**
- Creating, listing, and updating tasks
- Managing task hierarchies (parent-child relationships)
- Setting task status (backlog → ready → in_progress → review → done → closed)
- Managing tags and blocking relationships
- Tracking project progress with kanban board

**Key Commands:**
```bash
# Task operations
agkan task add "Title" "Body"
agkan task list --status ready
agkan task update <id> status in_progress
agkan task get <id> --json

# Tags and metadata
agkan task tag add "feature"
agkan task meta set <id> priority high
```

### 2. execute-planning

Review backlog tasks to assess decomposition, implementation readiness, and priority ordering before development begins.

**Use Cases:**
- Reviewing backlog tasks for clarity and completeness
- Determining if tasks need to be decomposed into smaller units
- Moving ready tasks to the "ready" status
- Tagging tasks that should be deferred ("いつかやる")
- Investigating code to understand task requirements

**Typical Flow:**
1. Fetch all backlog tasks
2. For each task:
   - Confirm the content is clear (investigate code if needed)
   - Assess if decomposition is needed (1 task = 1 PR = 1 feature)
   - Move to "ready" status if implementation is clear and blockers are resolved
   - Tag with "いつかやる" if deferrable

### 3. execute-task

Pick the highest priority "ready" task, implement it, create a pull request, and mark it as done.

**Use Cases:**
- Selecting the next highest-priority task from the ready queue
- Starting a development session with a single focused task
- Following a structured execution workflow

**Priority Criteria:**
1. Importance level (high → medium → low)
2. Tag priority (bug → security → improvement → test → performance → refactor → docs)
3. Child tasks and blockers are prioritized

**Typical Flow:**
1. Fetch all ready tasks
2. Evaluate priority using importance and tag hierarchy
3. Select the highest-priority task
4. Delegate implementation to a sub-agent
5. Mark the task as complete or move to next task

### 4. execute-subtask

Implement a selected task in isolation, handle in_progress status updates, branch creation, implementation, PR creation, and completion.

**Use Cases:**
- Implementing a specific selected task
- Managing the complete development lifecycle (branch creation to PR)
- Handling code changes, commits, and pull request creation
- Updating task status through the development workflow

**Important:**
- This skill is not directly invokable by users
- Used internally by execute-task skill
- Expects a task to be pre-selected

**Typical Flow:**
1. Update task status to "in_progress"
2. Create a feature branch
3. Implement the task
4. Create and submit a pull request
5. Update task status to "review"

## Installation

### Add Marketplace

First, add the gendosu marketplace to your Claude Code:

```bash
/plugin marketplace add gendosu/gendosu-claude-plugins
```

### Install Plugin

Install the agkan-skills plugin:

```bash
/plugin install agkan-skills@gendosu-claude-plugins
```

Alternatively, if the marketplace is already added:

```bash
/plugin install agkan-skills
```

## Usage

### Basic Task Management

List all ready tasks:
```bash
/agkan list --status ready
```

Create a new task:
```bash
/agkan add "Implement user authentication" "Add login page and authentication flow"
```

Update task status:
```bash
/agkan update 1 status in_progress
```

### Planning Session

Review and plan backlog tasks:
```
Please use execute-planning skill to review our backlog tasks and prepare them for implementation.
```

### Execution Session

Start a development session with the highest priority task:
```
Start execution session - pick the highest priority ready task, implement it, and create a PR.
```

### Task Details

Get detailed information about a task:
```bash
/agkan get 1 --json
```

View task hierarchy:
```bash
/agkan list --tree
```

## Status Workflow

Tasks progress through the following states:

| Status | Description | Next |
|--------|-------------|------|
| `backlog` | Initial state for new unreviewed tasks | `ready` or `closed` |
| `ready` | Task is clear and ready for implementation | `in_progress` |
| `in_progress` | Actively being developed | `review` |
| `review` | PR created, awaiting review and merge | `done` |
| `done` | Completed and merged | `closed` (optional) |
| `closed` | Archived/completed | - |

## Tag Priority

Tags help categorize and prioritize tasks. When multiple tasks have the same importance level, use these tag priorities:

| Priority | Tag | Use Case |
|----------|-----|----------|
| 1 | `bug` | Critical bug fixes |
| 2 | `security` | Security issues |
| 3 | `improvement` | Feature improvements |
| 4 | `test` | Testing and test coverage |
| 5 | `performance` | Performance optimization |
| 6 | `refactor` | Code refactoring |
| 7 | `docs` | Documentation |

## Configuration

Configure agkan database path using `.agkan.yml` in your project root:

```yaml
path: ./.agkan/data.db
```

Or set the environment variable:

```bash
export AGENT_KANBAN_DB_PATH=/custom/path/data.db
```

## Project Structure

```
agkan-skills/
├── .claude-plugin/
│   └── plugin.json           # Plugin configuration
├── skills/
│   ├── agkan/
│   │   └── SKILL.md          # Core task management skill
│   ├── execute-planning/
│   │   └── SKILL.md          # Planning workflow skill
│   ├── execute-task/
│   │   └── SKILL.md          # Task execution skill
│   └── execute-subtask/
│       └── SKILL.md          # Subtask implementation skill
├── README.md                 # This file (English)
├── README.ja.md              # Japanese documentation
├── CHANGELOG.md              # Version history
└── LICENSE                   # MIT License
```

## Documentation

- [Japanese Documentation](./README.ja.md) - 日本語ドキュメント
- [Changelog](./CHANGELOG.md) - Version history and changes

## License

MIT License - See [LICENSE](./LICENSE) for details

## Author

**Gendosu**

## Repository

https://github.com/gendosu/gendosu-claude-plugins

## Version

0.1.0
