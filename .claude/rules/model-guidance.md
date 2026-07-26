---
paths: **/*
---

# Model Guidance Rules

## 対象モデルと想定

対象モデル世代: **Fable 5 / Opus 5 / Sonnet 5**。

`skills/` 配下のスキルは、実行時にどのモデル世代が呼び出すか静的に固定できない
（プロジェクト設定のモデル指定や、ユーザーによる `Agent(model=...)` 指定により、
同じ SKILL.md がいずれの世代からも呼ばれ得る）。したがって各 SKILL.md の記述は、
**呼び出し元モデルが Fable 5 / Opus 5 / Sonnet 5 のいずれであっても矛盾なく成立する**
ことを前提に書く。

このファイルの役割は「挙動差の根拠を1箇所に集約すること」であり、
実行時にモデルを判定するロジックは提供しない（詳細は下記「制約」を参照）。

---

## 挙動差の一覧表

| 項目 | Opus 5 | Sonnet 5 | Fable 5 | 出典 |
|---|---|---|---|---|
| **自己検証** | 明示指示は不要。既定で自己検証する。指示すると過剰検証を招くため、検証系の指示・ステップは削除する（能力低下なし） | — (本表では未分岐。Opus 5 に準ずる過剰検証傾向あり) | 独立コンテキストの検証サブエージェントが自己批判より有効。長時間の構築作業では自己チェック体制を明示的に確立させる | model-migration.md「Migrating to Claude Opus 5」> Behavioral shifts（"Over-verification — delete your verification scaffolding"）／「Migrating to Claude Fable 5」> Long-running agent recommendations（"Make self-verification explicit"） |
| **サブエージェント委譲** | Opus 4.8 とは逆に、過剰に委譲する傾向がある。明示的な上限（spawn cap）が必要 | — (本表では未分岐) | 積極的な委譲が有効。非同期的に並行実行させるガイダンスを与える | model-migration.md「Migrating to Claude Opus 5」> Behavioral shifts（"Delegates to subagents more readily — the opposite of Opus 4.8"）／「Migrating to Claude Fable 5」> Behavioral shifts（"Let it delegate — asynchronously"） |
| **早期停止** | 完遂傾向が強く、途中で意図表明のみで終わることは稀。リマインダ不要 | — (本表では未分岐) | 長時間セッションの末尾で、意図表明（"I'll now run X"）のみでツール呼び出しをせず終わる既知挙動あり（rare だが発生する）。ターン終了前に最終段落を確認させるリマインダが有効 | model-migration.md「Migrating to Claude Opus 5」> Behavioral shifts（"Task scope expansion" の finish-the-whole-task 節）／「Migrating to Claude Fable 5」> Behavioral shifts（"Rare: early stopping"） |
| **指示追従** | 4.7 以降、システムプロンプトを字義通り厳格に解釈する。`CRITICAL` / `MUST` / `forbidden` のような過剰表現は overtrigger を招くため、通常の断定表現（"Use X when..." 等）に置き換える | 同上。特に低 effort で literal な解釈が強まる | 同上。過度に prescriptive な指示は品質を下げるため、目標と制約を述べるに留め、手順を逐一列挙しない | model-migration.md「Prompt-Behavior Changes」（"Aggressive instructions cause overtriggering"）／「Migrating to Claude Sonnet 5」> Behavioral shifts（"More literal instruction following"）／「Migrating to Claude Fable 5」> Long-running agent recommendations（"De-prescribe migrated prompts and skills"） |
| **effort** | `low` / `medium` / `high` / `xhigh` / `max` の5段。API 既定は `high`。コーディング・エージェント作業は `xhigh` から開始し様子を見て下げる | 同じ5段構成。API 既定は `high`。最難関のコーディング・エージェント作業に `xhigh` を推奨 | 同じ5段構成。`low` でも旧モデルの `xhigh`/`max` 相当の性能が出ることがあるため、まず低い effort から試す | model-migration.md「Claude Opus 5 Migration Checklist」（"Effort: start xhigh for coding/agentic..."）／「Migrating to Claude Sonnet 5」> Choosing an effort level／「Migrating to Claude Fable 5」> Behavioral shifts（"Consider all effort levels"） |
| **コードレビュー** | severity フィルタ（"only report high-severity issues" 等）は recall を下げる。全件報告＋confidence/severity 付与とし、フィルタは下流の別パスに分離する | 同上。"only high-severity" 等の保守的指示は文字通り守られてしまい、実際のバグ発見力は変わらないまま measured recall だけが下がる | — (本表では未分岐。Opus 5 / Sonnet 5 と同じ原則を適用してよい) | model-migration.md「Migrating to Claude Opus 5」> Behavioral shifts（"Severity filters still depress measured recall"）／「Migrating to Claude Sonnet 5」> Behavioral shifts（"Code review harnesses"） |

`—` は出典側のドキュメントで当該モデルに関する明示的な分岐記述が見つからなかったことを示す（誤りではなく未確認）。将来この行を埋める場合は、根拠となる migration guide の節を出典欄に追記すること。

---

## 各 SKILL.md へのインライン注記の定型フォーマット

各 SKILL.md 側には条件だけを書き、根拠はこのファイルへの相対パス参照に留める。

**定型フォーマット:**

```
> **モデル差:** <対象モデル> = <推奨内容>。詳細・出典は `.claude/rules/model-guidance.md` の「<項目名>」を参照。
```

**記入例（自己検証の項目を SKILL.md に転記する場合）:**

```
> **モデル差:** Opus 5 = 自己検証の明示指示は不要（既定で自己検証するため、指示すると過剰検証を招く）。
> Fable 5 = 独立コンテキストの検証サブエージェントを使う方が自己批判より有効。
> 詳細・出典は `.claude/rules/model-guidance.md` の「自己検証」を参照。
```

---

## 出典

すべての行の出典は claude-api スキルが参照する **Model Migration Guide**
（`claude-api/shared/model-migration.md`）の該当節。節名は上表の出典欄に記載した通り:

- Migrating to Claude Opus 5 > Behavioral shifts / Claude Opus 5 Migration Checklist
- Migrating to Claude Sonnet 5 > Choosing an effort level on Claude Sonnet 5 / Behavioral shifts
- Migrating to Claude Fable 5 > Behavioral shifts / Long-running agent recommendations
- Prompt-Behavior Changes（Opus 4.5 / 4.6, Sonnet 4.6 — 指示追従の overtrigger 傾向は 4.6 系で確立され、4.7 以降も継続）

厳密な URL は不要。上記の節名を頼りに claude-api スキル（または WebFetch）で内容を再確認できる。

---

## 将来モデル追加時の更新手順

1. 新しいモデル世代の migration guide 該当節を確認し、このファイルの一覧表に列（または行の分岐）を追加する。
2. 追加した挙動差について、参照元の SKILL.md（インライン注記を持つファイル）を確認し、
   注記内容が新モデルの推奨と矛盾しないか点検する。矛盾する場合は注記文を更新する。
3. 一覧表の出典欄に、追加した節名を明記する。
4. 実行時のモデル判定コード（設定値の取得結果を条件分岐に使う、shell で `if` 分岐する等）は
   このファイルにも参照元 SKILL.md にも追加しない（次項「制約」を参照）。

---

## 制約

- **実行時のモデル判定は行わない。** ここに書くのは静的な条件記述のみ。
  「今回の呼び出し元がどのモデルか」の判定は実行エージェント自身の自己認識に委ねる。
  設定コマンドから取得した値を条件分岐に使う実装や、shell スクリプトでの
  モデル分岐は本ファイル・参照元スキルのいずれにも実装しない。
- `.claude/rules/skills-sync.md` の同期対象は `.claude/skills` と `./skills` の
  ディレクトリ同期のみであり、`.claude/rules/` 配下のファイルは対象外。
  したがって本ファイルは `./skills` 側に複製しない。
