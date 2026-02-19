# Changelog

All notable changes to the agkan-skills plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
