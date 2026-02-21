---
name: execute-task-direct
description: Use when starting a development session to pick the highest priority Todo task from agkan, implement it directly without PR/branch, and mark it done.
---

# execute-task-direct

## Overview

agkanのTodoタスクから優先度最高の1件を選び、ブランチ・PRを作成せずに直接実装して完了させるワークフロー。

---

## ワークフロー

### 1. ブランチを最新化

```bash
git pull -p
```

### 2. Todoタスクを取得

```bash
agkan task list --status ready --json
```

### 3. 優先度の高いタスクを1件選択

以下の基準で降順に評価し、最上位の1件を選ぶ:

**重要度（importance フィールド）:**
```
高 > 中 > 低
```

**タグ（同重要度の場合に参照）:**
```
bug > security > improvement > test > performance > refactor > docs
```

**子タスクがある場合・ブロッカータスクがある場合**
対象の子タスク・ブロッカータスクを優先して選ぶ（重要度・タグの基準は同じ）

### 4. タスクをin_progressに更新

```bash
agkan task update <id> status in_progress
```

### 5. 実装・完了

**Task ツール（general-purpose サブエージェント）** を使って実装する。
`Skill("execute-subtask-direct")` は使わず、サブエージェントに SKILL.md を読み込ませる形で呼び出す:

```
Task(
  subagent_type="general-purpose",
  description="Implement task #<id>",
  prompt="""
以下のタスクを実装してください。

load /key-guidelines

## タスク情報
- ID: <id>
- タイトル: <title>
- 本文: <body>

## 手順
.claude/skills/execute-subtask-direct/SKILL.md を読み込み、その手順に従って実装してください。
"""
)
```

### 6. セッション終了 or 繰り返し

ユーザによる終了指示がない場合は、次のタスクを選択して同様のワークフロー1から繰り返す。

---

## 優先度判定フロー

```
Todoタスク一覧
    ↓
重要度でソート（高→中→低）
    ↓
同じ重要度が複数？
   Yes → タグ優先度でソート（bug→security→...→docs）
   No  → 最上位を選択
    ↓
1件を選択して着手
```

---

## タグ優先度一覧

| 優先度 | タグ名 |
|--------|--------|
| 1 | bug |
| 2 | security |
| 3 | improvement |
| 4 | test |
| 5 | performance |
| 6 | refactor |
| 7 | docs |

---

## 注意事項

- 必ず1件のみ選択する（複数同時着手しない）
- タスクが存在しない場合はセッションを終了する
- ブランチ・PRは作成しない（カレントブランチに直接コミット）
- 実装完了後にタスクをdoneに更新する
