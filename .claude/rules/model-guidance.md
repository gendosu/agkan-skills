---
paths: **/*
---

# Model Guidance Rules

## Target Models and Assumptions

Target model generations: **Fable 5 / Opus 5 / Sonnet 5**.

Skills under `skills/` cannot statically pin which model generation will invoke them at
runtime (a project's model configuration or a user's `Agent(model=...)` override means the
same SKILL.md can be called by any of these generations). Each SKILL.md must therefore be
written so that **it holds without contradiction regardless of whether the calling model is
Fable 5, Opus 5, or Sonnet 5**.

This file's role is to centralize the evidence behind behavioral differences in one place;
it does not provide runtime logic for detecting which model is calling (see "Constraints"
below for details).

---

## Behavioral Difference Table

| Item | Opus 5 | Sonnet 5 | Fable 5 | Source |
|---|---|---|---|---|
| **Self-verification** | No explicit instruction needed. Self-verifies by default. Instructing it to do so invites over-verification, so verification-related instructions/steps should be removed (no capability loss) | — (not distinguished in this table; likely shares Opus 5's over-verification tendency) | An independent-context verification subagent is more effective than self-critique. Explicitly establish a self-check regimen for long-running build work | model-migration.md "Migrating to Claude Opus 5" > Behavioral shifts ("Over-verification — delete your verification scaffolding") / "Migrating to Claude Fable 5" > Long-running agent recommendations ("Make self-verification explicit") |
| **Subagent delegation** | Unlike Opus 4.8, tends to over-delegate. Needs an explicit spawn cap | — (not distinguished in this table) | Benefits from eager delegation. Give guidance to run subagents concurrently, asynchronously | model-migration.md "Migrating to Claude Opus 5" > Behavioral shifts ("Delegates to subagents more readily — the opposite of Opus 4.8") / "Migrating to Claude Fable 5" > Behavioral shifts ("Let it delegate — asynchronously") |
| **Early stopping** | Strong completion tendency; rarely ends mid-task with only a stated intent. No reminder needed | — (not distinguished in this table) | Has a known behavior (rare, but it happens) at the end of long sessions of ending with only a stated intent ("I'll now run X") and no tool call. A reminder to check the final paragraph before ending the turn is effective | model-migration.md "Migrating to Claude Opus 5" > Behavioral shifts (the finish-the-whole-task section under "Task scope expansion") / "Migrating to Claude Fable 5" > Behavioral shifts ("Rare: early stopping") |
| **Instruction following** | From 4.7 onward, interprets the system prompt strictly and literally. Overloaded phrasing like `CRITICAL` / `MUST` / `forbidden` causes overtriggering, so replace it with plain declarative phrasing ("Use X when..." etc.) | Same as Opus 5. Literal interpretation is especially pronounced at low effort | Same as above. Overly prescriptive instructions degrade quality, so state goals and constraints only, without enumerating steps one by one | model-migration.md "Prompt-Behavior Changes" ("Aggressive instructions cause overtriggering") / "Migrating to Claude Sonnet 5" > Behavioral shifts ("More literal instruction following") / "Migrating to Claude Fable 5" > Long-running agent recommendations ("De-prescribe migrated prompts and skills") |
| **Effort** | 5 tiers: `low` / `medium` / `high` / `xhigh` / `max`. API default is `high`. Start coding/agentic work at `xhigh` and dial down based on observed results | Same 5-tier structure. API default is `high`. `xhigh` is recommended for the hardest coding/agentic work | Same 5-tier structure. Even `low` can match the older models' `xhigh`/`max`-equivalent performance, so try a lower effort tier first | model-migration.md "Claude Opus 5 Migration Checklist" ("Effort: start xhigh for coding/agentic...") / "Migrating to Claude Sonnet 5" > Choosing an effort level / "Migrating to Claude Fable 5" > Behavioral shifts ("Consider all effort levels") |
| **Code review** | Severity filters ("only report high-severity issues", etc.) depress recall. Report all findings with confidence/severity attached, and separate filtering into a downstream pass | Same as Opus 5. Conservative instructions like "only high-severity" are followed literally; actual bug-finding capability is unchanged but measured recall drops | — (not distinguished in this table; the same principle as Opus 5 / Sonnet 5 can be applied) | model-migration.md "Migrating to Claude Opus 5" > Behavioral shifts ("Severity filters still depress measured recall") / "Migrating to Claude Sonnet 5" > Behavioral shifts ("Code review harnesses") |

`—` indicates that no explicit branching description for that model was found in the source
document (not an error, just unconfirmed). When filling in this cell later, add the relevant
migration guide section to the Source column as evidence.

---

## Standard Format for Inline Notes in Each SKILL.md

Each SKILL.md should state only the condition; the supporting evidence should stay a relative
path reference to this file.

**Standard format:**

```
> **Model differences:** <target model> = <recommendation>. See "<item name>" in `.claude/rules/model-guidance.md` for details and sources.
```

**Example entry (transcribing the self-verification item into a SKILL.md):**

```
> **Model differences:** Opus 5 = no explicit self-verification instruction needed (self-verifies
> by default; instructing it to do so invites over-verification).
> Fable 5 = an independent-context verification subagent is more effective than self-critique.
> See "Self-verification" in `.claude/rules/model-guidance.md` for details and sources.
```

---

## Sources

Every row's source is the relevant section of the **Model Migration Guide**
(`claude-api/shared/model-migration.md`), referenced by the claude-api skill. Section names
are as listed in the Source column above:

- Migrating to Claude Opus 5 > Behavioral shifts / Claude Opus 5 Migration Checklist
- Migrating to Claude Sonnet 5 > Choosing an effort level on Claude Sonnet 5 / Behavioral shifts
- Migrating to Claude Fable 5 > Behavioral shifts / Long-running agent recommendations
- Prompt-Behavior Changes (Opus 4.5 / 4.6, Sonnet 4.6 — the overtriggering tendency in
  instruction following was established in the 4.6 generation and continues from 4.7 onward)

Exact URLs are not required. The section names above are enough to re-verify the content via
the claude-api skill (or WebFetch).

---

## Update Procedure When Adding a Future Model

1. Check the relevant migration guide section for the new model generation and add a column
   (or a row-level branch) to this file's table.
2. For each added behavioral difference, check the referencing SKILL.md files (those with
   inline notes) and verify the note's content doesn't contradict the new model's
   recommendation. Update the note text if it does.
3. Record the added section name in the table's Source column.
4. Do not add runtime model-detection code (using a fetched config value in a conditional,
   `if` branching in a shell script, etc.) to either this file or the referencing SKILL.md
   files (see "Constraints" below).

---

## Constraints

- **Do not perform runtime model detection.** Only static conditional statements belong
  here. Determining "which model is the current caller" is left to the executing agent's
  own self-awareness. Do not implement, in this file or any referencing skill, logic that
  branches on a value fetched from a config command, or model branching in a shell script.
- `.claude/rules/skills-sync.md` only syncs the `.claude/skills` and `./skills` directories;
  files under `.claude/rules/` are out of scope. This file is therefore not duplicated into
  `./skills`.
