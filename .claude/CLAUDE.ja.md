# rules

commit: 英語
pull-request: 英語
.claude/rulesの記述: 英語

# このskillsの使い方

agkanにタスクを登録する。status: backlogで入る。

## agkan-icebox

iceboxのタスクを一件ずつ精査し、backlogに昇格させるかcloseするかを判断する。
要件が明確になったものはbacklogへ、不要になったものはclosedにする。

## agkan-planning

backlogのタスクを一件ずつ精査し、実行できるタスクリスト形式に書き換える。
迷いなく実行できる状態であればstatus: readyにする。
全件処理が終わるまで繰り返す。

## agkan-run

readyのタスクで優先度高い物から一つ選び、in_progressに変える。
サブタスクに実行を委譲する。

## agkan-run-direct

readyのタスクで優先度高い物から一つ選び、ブランチ・PRを作成せずにカレントブランチへ直接実装してdoneにする。

## agkan-review

status: reviewのタスクで、github prがクローズかmergedの場合に、close or doneに変える。
