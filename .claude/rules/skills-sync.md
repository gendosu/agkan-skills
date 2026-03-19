# Skills Sync Rules

## 対象ディレクトリ

`.claude/skills` と `./skills` の2つのディレクトリは常に同期する。

どちらか一方にスキルを追加・変更・削除した場合は、もう一方にも同じ変更を反映すること。

## 例外

`.claude/skills/release` ディレクトリは同期対象外とする。

`./skills` 側には `release` ディレクトリを置かない。

## 運用ルール

- スキルの追加・変更・削除は必ず両方のディレクトリに反映する
- `.claude/skills/release` のみ例外として片方（`.claude/skills`）にのみ存在する
- 同期の確認は `ls .claude/skills` と `ls skills` を比較して行う（`release` を除く）
