# 変更履歴

agkan-skills プラグインの主な変更をこのファイルに記録します。

この形式は [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づき、
本プロジェクトは [Semantic Versioning](https://semver.org/lang/ja/spec/v2.0.0.html) に準拠しています。

0.21.0 以前の変更履歴は [英語版 CHANGELOG](./CHANGELOG.md#0210---2026-10-16) を参照してください。

## [Unreleased]

## [0.21.1] - 2026-10-27

### 修正

- **agkan-planning / agkan-planning-subtask**: 計画時に未解決の要件をユーザーへ質問し、回答後に同じタスクの計画を再開するよう修正。未回答の質問だけを理由に先送りと判定しないように変更。サブエージェントから親エージェントへの質問の引き継ぎと、Codex の質問ツールが使用できない場合に会話で直接質問する手順を明確化。Ready へ移行する際に `will-do-later` タグを解除
