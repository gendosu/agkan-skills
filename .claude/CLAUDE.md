このskillsの使い方

agkanにタスクを登録する。status: backlogで入る。

## execute-planning

backlogのタスクを一件ずつ精査し、実行できるタスクリスト形式に書き換える。
迷いなく実行できる状態であればstatus: readyにする。
全件処理が終わるまで繰り返す。

## execute-task

readyのタスクで優先度高い物から一つ選び、in_progressに変える。
サブタスクに実行を委譲する。

## execute-review

status: reviewのタスクで、github prがクローズかmergedの場合に、close or doneに変える。
