#!/usr/bin/env bash
set -euo pipefail

done_count=0
closed_count=0
skipped_open_count=0
no_pr_count=0

default_branch=$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)

# A stacked PR merged before its blocker lands in the blocker's branch, not the default branch.
in_default_branch() {
  local base=$1 sha=$2
  [ "$base" = "$default_branch" ] && return 0
  [ -n "$sha" ] || return 1
  case "$(gh api "repos/{owner}/{repo}/compare/${default_branch}...${sha}" -q .status 2>/dev/null || true)" in
    behind|identical) return 0 ;;
    *) return 1 ;;
  esac
}

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

  pr_json=$(gh pr view "$pr_url" --json state,mergedAt,baseRefName,mergeCommit 2>/dev/null || true)
  if [ -z "$pr_json" ]; then
    echo "[$id] $title — Failed to fetch PR: $pr_url"
    no_pr_count=$((no_pr_count + 1))
    continue
  fi

  state=$(echo "$pr_json" | jq -r '.state')
  merged_at=$(echo "$pr_json" | jq -r '.mergedAt // empty')
  base_ref=$(echo "$pr_json" | jq -r '.baseRefName // empty')
  merge_sha=$(echo "$pr_json" | jq -r '.mergeCommit.oid // empty')

  if [ "$state" = "MERGED" ] && ! in_default_branch "$base_ref" "$merge_sha"; then
    echo "[$id] $title — skipped (merged into $base_ref, not yet in $default_branch)"
    skipped_open_count=$((skipped_open_count + 1))
  elif [ "$state" = "MERGED" ]; then
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
echo "done: ${done_count}, closed: ${closed_count}, skipped (OPEN): ${skipped_open_count}, no PR: ${no_pr_count}"
