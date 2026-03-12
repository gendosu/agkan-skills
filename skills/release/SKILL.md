---
name: release
description: Use when you need to perform a release - handles version bumping, CHANGELOG update, tagging, pushing, and optional npm publish.
user-invokable: true
---

# release

## Overview

Workflow to automate the release process: select version type, run tests, update CHANGELOG, bump version, commit, tag, push, and optionally publish to npm.

---

## Workflow

### 1. Confirm Version Type

Ask or determine the version bump type based on the changes since the last release:

- **patch**: Bug fixes, documentation updates, performance improvements (backward-compatible)
- **minor**: New features added in a backward-compatible manner
- **major**: Breaking changes (incompatible API changes)

Refer to `.claude/rules/versioning.md` for detailed criteria.

### 2. Check Current Version

```bash
node -e "console.log(require('./package.json').version)"
```

### 3. Run Tests

```bash
npm test
```

If tests fail, stop the release and report the failure. Do not proceed.

### 4. Build

```bash
npm run build
```

If build fails, stop the release and report the failure. Do not proceed.

### 5. Update CHANGELOG.md

Update `CHANGELOG.md` following the [Keep a Changelog](https://keepachangelog.com/) format:

1. Move the `## [Unreleased]` section content to a new versioned section `## [X.Y.Z] - YYYY-MM-DD`
2. Add a new empty `## [Unreleased]` section at the top

Example:
```markdown
## [Unreleased]

## [1.2.0] - 2026-03-11

### Added
- Add `release` skill for automated release management

### Fixed
- Fix database path resolution
```

### 6. Bump Version

```bash
npm version patch|minor|major --no-git-tag-version
```

Use `--no-git-tag-version` to prevent npm from creating the git tag automatically (we handle tagging manually for full control).

Verify the version was updated:
```bash
node -e "console.log(require('./package.json').version)"
```

### 7. Commit Changes

Stage only the relevant files explicitly. Do not use `git add -A` or `git add .`.

```bash
git add package.json CHANGELOG.md
git commit -m "chore: release vX.Y.Z"
```

> **Warning**: Do not use `git add -A` or `git add .`. Files like `.env`, `credentials.*`, and files containing sensitive information may be unintentionally committed.

### 8. Create Git Tag

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
```

Always use the `v` prefix for git tags (e.g., `v1.2.0`).

### 9. Push Commits and Tags

```bash
git push origin main
git push origin vX.Y.Z
```

Or push commits and all tags together:
```bash
git push origin main --tags
```

### 10. Publish to npm (Optional)

If this package should be published to the npm registry:

```bash
npm pack
npm install -g .
agkan --version
```

Verify the installed version matches the release version, then publish:

```bash
npm publish
```

---

## Decision Flow

```
Determine version type (patch / minor / major)
    ↓
Run tests → FAIL? → Stop and report
    ↓
Run build → FAIL? → Stop and report
    ↓
Update CHANGELOG.md
    ↓
npm version <type> --no-git-tag-version
    ↓
git add package.json CHANGELOG.md
git commit -m "chore: release vX.Y.Z"
    ↓
git tag -a vX.Y.Z -m "Release vX.Y.Z"
    ↓
git push origin main --tags
    ↓
npm publish? (optional)
```

---

## Version Type Selection Guide

| Change Type | Version Bump |
|-------------|-------------|
| Bug fixes, typo fixes, performance improvements | patch |
| New commands, new backward-compatible options | minor |
| Removed/renamed commands, changed argument structure | major |

---

## Important Notes

- Never skip versions; always increment from the current version
- Always use the `v` prefix for git tags (e.g., `v1.2.0`)
- Always update CHANGELOG.md before creating the release commit
- Run the full test suite before any release
- If `npm publish` is not needed for this project, skip step 10
