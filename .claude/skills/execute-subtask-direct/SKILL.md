---
name: execute-subtask-direct
description: Use when a task has been selected and you need to implement it directly without PR/branch creation - handles implementation and marking done.
user-invokable: false
---

# execute-subtask-direct

## Overview

選択済みタスクを、ブランチ・PR作成なしに直接実装して完了させるワークフロー。

---

## ワークフロー

### 1. 実装

タスクの内容に従って実装を行う。

実装時に/key-guidelinesを参照し、コード品質を保つこと。

### 2. コミット

変更をコミットする。

```bash
git add <files>
git commit -m "<commit message>"
```

### 3. タスクをdoneに更新

```bash
agkan task update <id> status done
```

---

## 注意事項

- ブランチを作成しない（カレントブランチに直接作業する）
- PRを作成しない
- 実装完了後に直接doneに更新する
- このスキルはタスク選択後に使用する（タスク選択は `execute-task-direct` スキルで行う）
