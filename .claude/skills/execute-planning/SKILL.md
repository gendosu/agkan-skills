---
name: execute-planning
description: Use when reviewing backlog tasks to assess decomposition, implementation readiness, and priority ordering before development begins.
---

# execute-planning

## Overview

agkanを使用してBacklogタスクを精査し、分解・Ready移動・先送りの判断を行うプランニングワークフロー。

---

## ワークフロー

### 1. Backlogタスクを取得

```bash
agkan task list --status backlog --json
```

### 2. タスクを1件ずつサブエージェントで精査

各タスクに対して **Task ツール（general-purpose サブエージェント）** を使って精査する。
`Skill("execute-planning-subtask")` は使わず、サブエージェントに SKILL.md を読み込ませる形で呼び出す:

または、タスクIDが指定されていたら、対象のタスクのみ精査する。

```
Task(
  subagent_type="general-purpose",
  description="Review task #<id>",
  prompt="""
以下のBacklogタスクを精査してください。

## タスク情報
- ID: <id>
- タイトル: <title>
- 本文: <body>

## 手順
.claude/skills/execute-planning-subtask/SKILL.md を読み込み、その手順に従って精査してください。
"""
)
```

### 3. セッション終了 or 繰り返し

全件処理が終わるまで繰り返す。ユーザによる終了指示がない場合は、次のタスクを選択して同様のワークフロー2から繰り返す。

---

## 判断フロー

```
Backlogタスクを取得
    ↓
タスク1件をサブエージェントに委譲
    ↓
サブエージェントが精査・判断を実行
  - 内容が不明確？ → コード調査 → タスクに追記
  - 分解できる？ → サブタスクに分割 → 元タスクをクローズ
  - 今すぐ実装可能？ → Readyへ移動
  - それ以外 → いつかやるタグを付けてBacklogのまま
    ↓
次のタスクへ（全件終了まで繰り返す）
```

---

## タグ優先度

タスクにタグを付ける際は以下の優先順位を基準にする:

| 優先度 | タグ名 |
|--------|-------------|
| 1 | bug |
| 2 | security |
| 3 | improvement |
| 4 | test |
| 5 | performance |
| 6 | refactor |
| 7 | docs |

---

## 注意事項

- `いつかやる` タグのタスクは、Readyタスクがなくなった後に再検討する
- タスク分解時は元タスクの内容を引き継ぐ
- Readyに移動するのは「今すぐ着手できる」ものだけ
