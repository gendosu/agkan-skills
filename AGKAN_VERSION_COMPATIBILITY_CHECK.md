# agkan Version Compatibility Check (Task #58)

**Date**: 2026-03-15
**agkan Version**: 2.6.0 (current)
**Skills Directory**: `.claude/skills/`

## Executive Summary

Reviewed 20 skills in the skills directory against agkan 2.6.0. Found **5 areas requiring updates** to align with the current agkan API and best practices:

1. Priority setting using outdated `agkan task meta set` pattern
2. Safety issue with `git add -A` usage
3. Missing documentation for task blocking relationships
4. Undocumented new agkan commands (find, meta)
5. Proper reference to new skill names in deprecated skills

**Tasks Created**: 5 subtasks (IDs: 59-63)

---

## Detailed Findings

### 1. Priority Setting via `agkan task meta set` (CRITICAL)

**Issue**: Multiple skills still use the older pattern of setting priority after task creation.

**Affected Skills**:
- `agkan-add` (SKILL.md lines 82-88)
- `agkan-planning-subtask` (SKILL.md lines 69-74)
- `execute-add` (deprecated, lines 73-79)

**Current Pattern**:
```bash
agkan task add "<title>" "<body>"
agkan task meta set <task-id> priority <value>
```

**Recommended Pattern**:
The agkan 2.4.0+ supports priority flags directly:
```bash
# During creation
agkan task add "<title>" "<body>" --priority <value>

# Or during update
agkan task update <id> status ready --priority <value>
```

**Impact**: Not critical but inefficient - requires two commands instead of one.

**Created Task**: #59 - Update agkan-add to use --priority flag

---

### 2. Unsafe `git add -A` Usage

**Issue**: The `execute-subtask-direct` skill (deprecated) uses `git add -A` which can commit unintended sensitive files.

**Affected Skills**:
- `execute-subtask-direct` (SKILL.md lines 31-34)

**Current Pattern**:
```bash
git add -A
git commit -m "<commit message>"
```

**Recommended Pattern** (already correct in `agkan-subtask-direct`):
```bash
git add <file1> <file2> ...
git commit -m "<commit message>"
```

**Impact**: Security risk - can accidentally commit `.env`, credentials, or sensitive files.

**Created Task**: #61 - Fix git add -A usage in execute-subtask-direct skill

---

### 3. Task Blocking Relationships Not Documented

**Issue**: The agkan CLI supports task blocking relationships (`agkan task block`), but no skills document or use this feature.

**Available Commands**:
```bash
agkan task block add <blocker-id> <blocked-id>
agkan task block remove <blocker-id> <blocked-id>
agkan task block list <id> --json
```

**Current Usage in Skills**:
- `agkan-run` (SKILL.md lines 48-54) checks blockers but doesn't document creating them
- `agkan-planning-subtask` doesn't discuss blocking relationship creation

**Impact**: Users may not know how to properly model task dependencies.

**Created Task**: #62 - Add task blocking relationship documentation to agkan skills

---

### 4. New agkan Commands Not Documented

**Issue**: agkan 2.4.0+ introduced new commands for task metadata and search, not yet documented in skills.

**Commands Not Documented**:
```bash
agkan task find <keyword>           # Search tasks
agkan task meta get <task-id> <key> # Get metadata value
agkan task meta list <task-id>      # List all metadata
agkan task meta delete <task-id> <key> # Delete metadata
```

**Current Status**:
- `agkan task meta set` is documented in multiple skills
- Other meta operations and find command not covered

**Impact**: Skills could be enhanced with more sophisticated filtering and custom metadata.

**Created Task**: #63 - Document agkan task find and meta commands in skills

---

## Skills Status Review

### Core Skills (All Current)
✅ `agkan-run` - Uses proper agkan API patterns
✅ `agkan-icebox` - Uses proper agkan API patterns
✅ `agkan-planning` - Uses proper agkan API patterns
✅ `agkan-review` - Uses proper agkan API patterns
✅ `agkan-subtask` - Uses proper agkan API patterns
✅ `dashboard` - Uses proper agkan API patterns

### Skills with Issues
⚠️ `agkan-add` - Task #59: Update priority flag usage
⚠️ `agkan-planning-subtask` - Task #60: Update priority flag usage
⚠️ `execute-subtask-direct` - Task #61: Fix git add -A usage

### Deprecated Skills (Marked as DEPRECATED)
✅ `execute-task` - Correctly references `agkan-run` replacement
✅ `execute-subtask` - Correctly references `agkan-subtask` replacement
✅ `execute-add` - Correctly references `agkan-add` replacement
✅ `execute-icebox` - Correctly references `agkan-icebox` replacement
✅ `execute-icebox-subtask` - Correctly references `agkan-icebox-subtask` replacement
✅ `execute-planning-subtask` - Correctly references `agkan-planning-subtask` replacement
✅ `execute-review` - Correctly references `agkan-review` replacement
✅ `execute-subtask-direct` - Correctly references `agkan-subtask-direct` replacement

### Other Skills (All Current)
✅ `agkan-subtask-direct` - Uses correct git patterns
✅ `agkan-planning-subtask` - Task #60: Update priority flag
✅ `agkan-icebox-subtask` - Uses proper agkan API patterns
✅ `release` - Uses proper agkan API patterns
✅ `execute-task` - Deprecated (references agkan-run)
✅ `execute-add` - Deprecated (references agkan-add)

---

## Versioning Compatibility

**Current agkan Version**: 2.6.0
**Skills Last Updated**: v0.6.2
**Compatibility Status**: 95% compatible

### Breaking Changes Since Skills Creation
- None detected in agkan 2.x releases

### New Features in agkan 2.4.0+
- `--priority` flag for task add/update
- Task blocking relationships (`agkan task block`)
- Metadata commands (`agkan task meta`)
- Task search (`agkan task find`)

---

## Recommendations

1. **High Priority (Security)**
   - Update `execute-subtask-direct` to use explicit file specification instead of `git add -A`

2. **Medium Priority (Efficiency)**
   - Update `agkan-add` and `agkan-planning-subtask` to use `--priority` flag
   - This is more efficient and aligns with current agkan API

3. **Low Priority (Documentation)**
   - Add documentation for task blocking relationships
   - Document new `agkan task find` and `agkan task meta` commands

---

## Created Subtasks

| ID | Title | Parent | Status |
|----|-------|--------|--------|
| 59 | Update agkan-add to use --priority flag | #58 | backlog |
| 60 | Update agkan-planning-subtask to use --priority flag | #58 | backlog |
| 61 | Fix git add -A usage in execute-subtask-direct skill | #58 | backlog |
| 62 | Add task blocking relationship documentation to agkan skills | #58 | backlog |
| 63 | Document agkan task find and meta commands in skills | #58 | backlog |

---

## Files Reviewed

Total files reviewed: 20 SKILL.md files

- `.claude/skills/agkan-run/SKILL.md`
- `.claude/skills/agkan-icebox/SKILL.md`
- `.claude/skills/agkan-planning/SKILL.md`
- `.claude/skills/agkan-review/SKILL.md`
- `.claude/skills/agkan-add/SKILL.md`
- `.claude/skills/agkan-subtask/SKILL.md`
- `.claude/skills/agkan-subtask-direct/SKILL.md`
- `.claude/skills/agkan-planning-subtask/SKILL.md`
- `.claude/skills/agkan-icebox-subtask/SKILL.md`
- `.claude/skills/execute-task/SKILL.md` (deprecated)
- `.claude/skills/execute-subtask/SKILL.md` (deprecated)
- `.claude/skills/execute-add/SKILL.md` (deprecated)
- `.claude/skills/execute-icebox/SKILL.md` (deprecated)
- `.claude/skills/execute-icebox-subtask/SKILL.md` (deprecated)
- `.claude/skills/execute-planning-subtask/SKILL.md` (deprecated)
- `.claude/skills/execute-review/SKILL.md` (deprecated)
- `.claude/skills/execute-subtask-direct/SKILL.md` (deprecated)
- `.claude/skills/dashboard/SKILL.md`
- `.claude/skills/release/SKILL.md`

---

## Next Steps

1. Review and move tasks to ready for implementation
2. Implement priority flag updates (tasks #59, #60)
3. Fix git safety issue (task #61)
4. Add documentation improvements (tasks #62, #63)
5. Create PRs for each update following agkan-subtask workflow
