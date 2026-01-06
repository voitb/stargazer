---
id: task-002
title: Clean task directory
status: done
assignee: voitb
priority: high
labels:
  - setup
  - cleanup
created: '2026-01-01'
order: 20
---
## Description

Remove existing Lunamark task files and prepare for Stargazer tasks.

## Acceptance Criteria

- [x] Delete all files in `apps/lunamark/tasks/`
- [x] Create `apps/lunamark/tasks/.gitkeep`

## Test

```bash
ls apps/lunamark/tasks/
# Should show only .gitkeep
```
