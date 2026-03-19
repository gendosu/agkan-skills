# rules

commit: English
pull-request: English
.claude/rules content: English

# How to use these skills

Register tasks in agkan. They enter with status: backlog.

## agkan-icebox

Review icebox tasks one by one and decide whether to promote them to backlog or close them.
Tasks with clear requirements move to backlog, and tasks that are no longer needed are closed.

## agkan-planning

Review backlog tasks one by one and rewrite them into executable task list format.
Tasks that can be executed without hesitation should have status: ready.
Repeat until all tasks are processed.

## agkan-run

Select one task from ready tasks with the highest priority and change it to in_progress.
Delegate execution to subtasks.

## agkan-run-direct

Select one task from ready tasks with the highest priority, implement it directly to the current branch without creating a branch or PR, and mark it as done.

## agkan-review

For tasks with status: review where the github pr is closed or merged, change them to close or done.
