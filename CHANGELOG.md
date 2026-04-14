# Changelog

All notable changes to the agkan-skills plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.11.0] - 2026-04-14

### Added

- **agkan-planning-subtask**: Add blocking relationship setup step using `agkan task block add` for both directions (blocks/blocked-by) during planning
- **agkan-planning-subtask**: Allow tasks to move to Ready even when blocked — planning completeness (single PR scope, clear implementation approach) is the deciding factor, not whether blockers are resolved

### Changed

- **agkan-planning-subtask**: Remove "dependent tasks not completed" from deferral criteria — blocked tasks no longer stay in Backlog solely due to unresolved blockers

## [0.10.6] - 2026-04-13

### Fixed

- **agkan-planning-subtask**: Separate blocker handling from `will-do-later` deferral — tasks with blockers now stay in Backlog without a tag; the `will-do-later` tag is reserved for intentional deferral beyond the current cycle

## [0.10.5] - 2026-04-13

### Documentation

- **agkan-add**: Add blocking dependency setup step using `agkan task block add`

## [0.10.4] - 2026-04-04

### Fixed

- **agkan**, **agkan-icebox**, **agkan-review**, **agkan-subtask**, **agkan-run**, **agkan-planning-subtask**: Correct `--status` flag syntax in task update commands

### Documentation

- **agkan**: Add `task find --status` option to SKILL.md
- **agkan**: Add `board` subcommand details to SKILL.md

## [0.10.3] - 2026-04-03

### Documentation

- **agkan**: Add task copy command to SKILL.md

## [0.10.2] - 2026-03-30

### Fixed

- **agkan-subtask-direct**: Add branch metadata check step; checkout pre-assigned branch from `agkan task meta get <id> branch` before implementation and push to it after commit
- **agkan-subtask**: Check task metadata (`agkan task meta get <id> branch`) as primary branch source before falling back to body `Branch:` label parsing
- **agkan-subtask**, **agkan-run**: Keep tasks `in_progress` on critical errors instead of moving to review/done
- **agkan-planning-subtask**: Enforce body update step to preserve task body content

## [0.10.1] - 2026-03-27

### Fixed

- **agkan-planning-subtask**, **agkan-icebox-subtask**, **agkan-subtask**, **agkan-run**, **execute-subtask**, **execute-planning-subtask**, **execute-icebox-subtask**: Fix newline escaping issue when updating task body. Use `--file` option with a tmp file instead of inline body argument to preserve multiline formatting

## [0.10.0] - 2026-03-25

### Added

- **agkan-review**: Add summary display at end of review session
- **agkan-review**: Add comment step when updating task status to done/closed
- **agkan-review**: Add metadata `pr` key as fallback for PR URL lookup

### Documentation

- **agkan**: Add export/import commands to SKILL.md

## [0.9.1] - 2026-03-22

### Changed

- **agkan-subtask-direct**: Move TSC check and task-done update into sub-agent

### Documentation

- Remove language-specific content from skill files

## [0.9.0] - 2026-03-21

### Added

- **agkan-subtask / agkan-run**: Call `agkan task meta set` to store branch and PR URL as task metadata after creation

## [0.8.3] - 2026-03-20

### Fixed

- **agkan-subtask**: Create new branch from remote default branch instead of local

## [0.8.2] - 2026-03-20

### Added

- **agkan task get**: Include comments in JSON schema output

### Fixed

- **agkan-run**: Embed agkan-subtask workflow steps directly in sub-agent prompt

## [0.8.1] - 2026-03-20

### Documentation

- **agkan-add**: Replace `$'...'` shell escaping with `--file` option for multi-line task bodies

## [0.8.0] - 2026-03-19

### Added

- **agkan-run**: Inspect task body for existing Branch/PR before sub-agent launch
- **agkan-subtask**: Check for existing Branch/PR before creating new branch

### Fixed

- **agkan-run / agkan-subtask**: Use dynamic default branch instead of hardcoded value

### Documentation

- **agkan**: Add Body Conventions section for Branch/PR labels
- Add skills-sync rules for `.claude/skills` and `./skills` directories

## [0.7.2] - 2026-03-18

### Added

- Add `.gitignore` to exclude `.agkan.yml` from version control

## [0.7.1] - 2026-03-18

### Removed

- **release**: Remove release skill (moved to project-local skills)

## [0.7.0] - 2026-03-18

### Added

- **agkan-add**: Add `--priority` flag support for task creation

### Fixed

- **agkan-subtask-direct**: Replace `git add -A` with explicit file staging to prevent accidental commits
- **agkan-planning-subtask**: Add blocker check command (`agkan task block list`) in Step 3 before moving to Ready

### Documentation

- **agkan-run**: Clarify Step 8 trigger and merge Step 9 into Step 8
- **agkan-planning-subtask**: Add STRICT PROHIBITION section; fix command syntax
- **agkan-planning**: Add implementation constraint warning to sub-agent prompt

## [0.6.3] - 2026-03-18

### Fixed

- **agkan-run**: Stash uncommitted changes before switching to main; verify task status after sub-agent completes
- **agkan-subtask**: Make status→review step mandatory with verification

## [0.6.2] - 2026-03-13

### Documentation

- **agkan-run**: Add loop structure diagram and interruption handling guidance

## [0.6.1] - 2026-03-13

### Documentation

- Remove worktree references from execute-subtask skill documentation

## [0.6.0] - 2026-03-13

### Added

- **release**: New skill for automated release management (version bump, CHANGELOG, tagging, push, npm publish)
- **agkan-run / agkan-run-direct**: Add `critical` priority support in task selection
- **agkan-subtask-direct**: Add `in_progress` status update step before implementation

### Changed

- **agkan-subtask**: Restore `context: fork` metadata and update workflow for bidirectional sync
- **agkan-subtask / deprecated skills**: Add English translations for all skill files

### Fixed

- **agkan-add**: Use `--priority` flag instead of `meta set` for priority setting
- **agkan-planning-subtask**: Use `--priority` flag for priority setting
- **agkan-subtask**: Use explicit file staging instead of `git add -A`
- **agkan-icebox**: Add re-fetch logic in step 3

### Documentation

- Add `--priority` filter and `--sort priority` options to agkan/SKILL.md
- Add task purge command to agkan/SKILL.md Quick Reference
- Add `$'...'` syntax guidance for newlines in agkan-add body
- Add English translation of CLAUDE.md
- Document release skill in README

## [0.5.0] - 2026-03-09

### Added

- **agkan-add**: New skill name for `execute-add` (renamed with `agkan-` prefix)
- **agkan-icebox**: New skill name for `execute-icebox` (renamed with `agkan-` prefix)
- **agkan-icebox-subtask**: New skill name for `execute-icebox-subtask` (renamed with `agkan-` prefix)
- **agkan-planning**: New skill name for `execute-planning` (renamed with `agkan-` prefix)
- **agkan-planning-subtask**: New skill name for `execute-planning-subtask` (renamed with `agkan-` prefix)
- **agkan-run**: New skill name for `execute-task` (renamed from `execute-task` to `agkan-run`)
- **agkan-run-direct**: New skill name for `execute-task-direct` (renamed from `execute-task-direct` to `agkan-run-direct`)
- **agkan-subtask**: New skill name for `execute-subtask` (renamed with `agkan-` prefix)
- **agkan-subtask-direct**: New skill name for `execute-subtask-direct` (renamed with `agkan-` prefix)
- **agkan-review**: New skill name for `execute-review` (renamed with `agkan-` prefix)

### Deprecated

- **execute-add**: Deprecated in favor of `agkan-add`
- **execute-icebox**: Deprecated in favor of `agkan-icebox`
- **execute-icebox-subtask**: Deprecated in favor of `agkan-icebox-subtask`
- **execute-planning**: Deprecated in favor of `agkan-planning`
- **execute-planning-subtask**: Deprecated in favor of `agkan-planning-subtask`
- **execute-task**: Deprecated in favor of `agkan-run`
- **execute-task-direct**: Deprecated in favor of `agkan-run-direct`
- **execute-subtask**: Deprecated in favor of `agkan-subtask`
- **execute-subtask-direct**: Deprecated in favor of `agkan-subtask-direct`
- **execute-review**: Deprecated in favor of `agkan-review`

## [0.4.4] - 2026-03-09

### Fixed

- **execute-planning**: Re-fetch backlog task list after each task processing to pick up newly added tasks

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
