#!/usr/bin/env bash
set -euo pipefail

done_count=0
closed_count=0
skipped_open_count=0
no_pr_count=0

tasks=$(agkan task list --status review --json)
task_ids=$(echo "$tasks" | jq -r '.tasks[].id')

if [ -z "$task_ids" ]; then
  echo "No review tasks found."
  exit 0
fi

for id in $task_ids; do
  task=$(echo "$tasks" | jq -r ".tasks[] | select(.id == $id)")
  title=$(echo "$task" | jq -r '.title')

  # Extract PR URL from body
  body=$(echo "$task" | jq -r '.body // ""')
  pr_url=$(echo "$body" | sed -n 's/.*PR: \(https:\/\/[^[:space:]]*\).*/\1/p' | head -1 || true)

  # Fallback to metadata
  if [ -z "$pr_url" ]; then
    pr_url=$(agkan task meta get "$id" pr --json 2>/dev/null | jq -r '.data.value // empty' 2>/dev/null || true)
  fi

  if [ -z "$pr_url" ]; then
    echo "[$id] $title — No PR URL found. Manual verification required."
    no_pr_count=$((no_pr_count + 1))
    continue
  fi

  pr_json=$(gh pr view "$pr_url" --json state,mergedAt 2>/dev/null || true)
  if [ -z "$pr_json" ]; then
    echo "[$id] $title — Failed to fetch PR: $pr_url"
    no_pr_count=$((no_pr_count + 1))
    continue
  fi

  state=$(echo "$pr_json" | jq -r '.state')
  merged_at=$(echo "$pr_json" | jq -r '.mergedAt // empty')

  if [ "$state" = "MERGED" ]; then
    agkan task update "$id" --status done
    agkan task comment add "$id" "Merged at ${merged_at}. PR was merged and task is complete."
    echo "[$id] $title — done (merged at $merged_at)"
    done_count=$((done_count + 1))
  elif [ "$state" = "CLOSED" ]; then
    agkan task update "$id" --status closed
    agkan task comment add "$id" "PR was closed without merging. Task moved to closed."
    echo "[$id] $title — closed"
    closed_count=$((closed_count + 1))
  else
    echo "[$id] $title — skipped (OPEN)"
    skipped_open_count=$((skipped_open_count + 1))
  fi
done

echo ""
echo "done: ${done_count}件, closed: ${closed_count}件, スキップ(OPEN): ${skipped_open_count}件, PR未設定: ${no_pr_count}件"
