# Changelog

All notable changes to the agkan-skills plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.3] - 2026-03-09

### Fixed

- **execute-task**: Re-fetch ready task list after each sub-agent completion to pick up newly added tasks
- **execute-task-direct**: Re-fetch ready task list after each sub-agent completion to pick up newly added tasks

## [0.4.2] - 2026-03-06

### Documentation

- **agkan**: Add `--all` flag to task list command (includes done/closed statuses)
- **agkan**: Add named option form for `task update` command (v1.6.0+)
- **agkan**: Add `--assignees` filter option to task list
- **agkan**: Add `agent-guide` command to Quick Reference section
- **execute-review**: Simplify PR URL recovery flow — skip task and prompt manual verification when URL is missing

## [0.4.1] - 2026-03-06

### Fixed

- **execute-review**: Clarified handling when PR URL is not found in task body
  - Added recovery flow: search GitHub for related PRs using task title
  - If candidates found, ask user to confirm via AskUserQuestion
  - If no candidates or user answers "なし", ask user to input URL directly
  - Update task body with confirmed URL and continue processing

## [0.4.0] - 2026-03-06

### Added

- **execute-add**: New skill for creating backlog tasks
  - Collects title, body, tags, priority, and parent task, then creates it with agkan
- **dashboard**: New skill for checking overall task status and project health
  - Shows counts by status, in-progress tasks, and high-priority ready tasks
- **execute-icebox**: Added sub-agent delegation for single-task icebox review
- **execute-task / execute-task-direct**: Skip tasks tagged with `will-do-later`

### Changed

- Consolidated tag priority table into agkan/SKILL.md for unified reference

### Fixed

- **execute-planning-subtask**: Corrected Explore skill reference
- **execute-planning-subtask**: Added `--parent` option to task decomposition command
- **execute-planning-subtask**: Unified tag attach parameter to `<tag-id-or-name>`
- **execute-task / execute-task-direct**: Added blocker check step before in_progress update
- **execute-task / execute-task-direct**: Read priority from list JSON metadata instead of individual meta get command
- **execute-subtask**: Added git commit and push steps
- **execute-subtask-direct**: Clarified git add and push steps
- **execute-subtask**: Restored `context: fork` frontmatter explanation
- Clarified key-guidelines skill invocation in sub-agent prompts
- Clarified body append procedure to get existing content before update

### Documentation

- Added missing agkan v1.6.0 commands to agkan/SKILL.md
- Added `--assignees`, `--blocked-by`, `--blocks` options to agkan task examples
- Clarified priority setting timing in execute-planning-subtask and agkan skills
- Explained why SKILL.md path is used instead of Skill() for sub-agents

## [0.3.0] - 2026-03-05

### Added

- **execute-icebox**: New skill for reviewing icebox tasks and deciding whether to promote them to backlog or close them
  - Defines icebox as a holding area for unclear requirements, external blockers, or low-priority ideas
  - Provides structured workflow: promote to backlog / close / keep in icebox
- **execute-planning-subtask**: New skill for reviewing a single backlog task to assess decomposition and readiness
- **execute-task-direct**: New skill for implementing tasks directly without creating a branch or PR
- **execute-subtask-direct**: New skill for implementing subtasks directly without creating a branch or PR
- **execute-review**: New skill for checking review tasks against GitHub PR status to move them to done or closed

### Fixed

- **execute-task / execute-task-direct**: Replaced non-existent `importance field` with correct `priority` metadata reference (`agkan task meta get <id> priority`)
- **execute-task**: Corrected duplicate step number (1→2→3→1→4→5 → 1→2→3→4→5→6)
- **execute-subtask**: Corrected missing step 1 (workflow now starts at step 1 instead of step 2)

### Changed

- Updated agkan SKILL.md Typical Workflows to include icebox review workflow
- Updated README.md and README.ja.md to reflect version 0.3.0 and all 8 skills

## [0.2.1] - 2026-03-05

### Fixed

- **agkan**: Corrected tag management commands from `agkan task tag *` to `agkan tag *`
  - `agkan task tag add/list/delete/attach/detach/show` → `agkan tag add/list/delete/attach/detach/show`

## [0.1.0] - 2026-02-19

### Added

- **agkan**: Core skill for managing tasks using the agkan CLI tool
  - Create, list, update, and organize tasks with hierarchical relationships
  - Manage task status workflow (backlog → ready → in_progress → review → done → closed)
  - Support for tags, metadata, and blocking relationships
  - JSON output for programmatic task processing

- **execute-planning**: Planning workflow skill for backlog review and task preparation
  - Review backlog tasks for clarity and completeness
  - Assess task decomposition requirements
  - Move tasks to "ready" status when implementation is clear
  - Tag deferrable tasks with custom labels
  - Investigate code to understand task requirements

- **execute-task**: Task execution skill for picking and implementing priority tasks
  - Select highest-priority ready tasks automatically
  - Evaluate priority using importance level and tag hierarchy
  - Delegate implementation to subtask execution
  - Support for structured execution workflow

- **execute-subtask**: Subtask implementation skill for complete development lifecycle
  - Manage development workflow from branch creation to pull request
  - Update task status through the development lifecycle
  - Handle code implementation and commit management
  - Create and submit pull requests automatically

- **Plugin Infrastructure**
  - Plugin configuration and marketplace integration
  - Comprehensive English documentation (README.md)
  - Japanese documentation (README.ja.md)
  - MIT License
  - Project structure for plugin distribution

### Changed

- Converted local skills from `.claude/skills/` to distributable plugin format
- Reorganized skill files under `skills/` directory for marketplace deployment

### Security

- Automatic backup creation before task database updates

[0.1.0]: https://github.com/gendosu/gendosu-claude-plugins/releases/tag/agkan-skills-v0.1.0
