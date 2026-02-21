---
name: execute-review
description: Use when checking review tasks against GitHub PR status to automatically move them to done or closed.
---

# execute-review

## Overview

agkanのReviewステータスのタスクを取得し、GitHub PRのマージ・クローズ状態を確認してステータスを自動更新するワークフロー。

---

## ワークフロー

### 1. Reviewタスクを取得

```bash
agkan task list --status review --json
```

### 2. 各タスクのPR URLを確認

タスクの本文（body）から `PR: <URL>` 形式でPR URLを抽出する。

URLが見つからない場合はスキップし、手動確認が必要な旨を出力する。

### 3. PR状態をGitHubで確認

```bash
gh pr view <PR URL> --json state,mergedAt
```

| フィールド | 意味 |
|-----------|------|
| `state` | `OPEN` / `CLOSED` / `MERGED` |
| `mergedAt` | マージ日時（nullの場合はマージなし） |

### 4. ステータスに応じて移動

| PR状態 | agkanステータス | コマンド |
|--------|----------------|---------|
| `MERGED` | `done` | `agkan task update <id> status done` |
| `CLOSED`（mergedAt が null） | `closed` | `agkan task update <id> status closed` |
| `OPEN` | 変更なし | スキップ（まだレビュー中） |

---

## 判断フロー

```
Reviewタスクを全件取得
    ↓
各タスクに対して繰り返す
    ↓
本文に "PR: <URL>" がある？
   No  → スキップ（手動確認を促すメッセージを出力）
   Yes → PR状態を確認
    ↓
PR state は？
   MERGED  → doneへ移動
   CLOSED  → closedへ移動
   OPEN    → スキップ（レビュー待ち）
    ↓
次のタスクへ（全件終了まで繰り返す）
```

---

## 注意事項

- PR URLはタスク本文中の `PR: <URL>` 形式を想定する
- PR URLが見つからない場合は手動確認を促す（タスクはスキップ）
- `done` は正常完了、`closed` は中断・取り下げを意味する
- `gh` コマンドが使えない環境では動作しない
