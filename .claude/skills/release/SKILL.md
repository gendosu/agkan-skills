---
name: release
description: Use when you need to perform a release - handles version bumping in plugin.json, CHANGELOG update, tagging, and pushing.
user-invokable: true
---

# release

## Overview

Workflow to automate the release process for this Claude plugin: select version type, update CHANGELOG, bump version in `plugin.json`, commit, tag, and push.

---

## Workflow

### 1. Confirm Version Type

Ask or determine the version bump type based on the changes since the last release:

- **patch**: Bug fixes, documentation updates, minor improvements (backward-compatible)
- **minor**: New skills added, new features in backward-compatible manner
- **major**: Breaking changes (removed/renamed skills, incompatible behavior changes)

### 2. Check Current Version

```bash
jq -r '.version' .claude-plugin/plugin.json
```

### 3. Update CHANGELOG.md

Update `CHANGELOG.md` following the [Keep a Changelog](https://keepachangelog.com/) format:

1. Move the `## [Unreleased]` section content to a new versioned section `## [X.Y.Z] - YYYY-MM-DD`
2. Add a new empty `## [Unreleased]` section at the top

Example:
```markdown
## [Unreleased]

## [0.8.0] - 2026-03-18

### Added
- Add `agkan-foo` skill for bar workflow
```

### 4. Bump Version in plugin.json

Edit `.claude-plugin/plugin.json` and update the `version` field manually:

```json
{
  "name": "agkan-skills",
  "version": "X.Y.Z",
  ...
}
```

Verify the version was updated:
```bash
jq -r '.version' .claude-plugin/plugin.json
```

### 5. Commit Changes

Stage only the relevant files explicitly:

```bash
git add .claude-plugin/plugin.json CHANGELOG.md
git commit -m "chore: release vX.Y.Z"
```

### 6. Create Git Tag

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
```

Always use the `v` prefix for git tags (e.g., `v0.8.0`).

### 7. Push Commits and Tags

```bash
git push origin main --tags
```

---

## Decision Flow

```
Determine version type (patch / minor / major)
    ↓
Update CHANGELOG.md
    ↓
Bump version in .claude-plugin/plugin.json
    ↓
git add .claude-plugin/plugin.json CHANGELOG.md
git commit -m "chore: release vX.Y.Z"
    ↓
git tag -a vX.Y.Z -m "Release vX.Y.Z"
    ↓
git push origin main --tags
```

---

## Version Type Selection Guide

| Change Type | Version Bump |
|-------------|-------------|
| Bug fixes, typo fixes, documentation updates | patch |
| New skills added, new features (backward-compatible) | minor |
| Removed/renamed skills, breaking behavior changes | major |

---

## Important Notes

- Never skip versions; always increment from the current version
- Always use the `v` prefix for git tags (e.g., `v0.8.0`)
- Always update CHANGELOG.md before creating the release commit
- Do not use `git add -A` or `git add .`
