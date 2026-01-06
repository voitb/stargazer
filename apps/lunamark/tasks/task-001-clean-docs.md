---
id: task-001
title: Clean docs - remove StargazerError
status: done
assignee: voitb
priority: high
labels:
  - docs
  - cleanup
created: '2026-01-01'
order: 10
---
## Description

Replace `StargazerError` branded type with simple `ApiError` type, and remove `Logger` interface from all documentation.

## Acceptance Criteria

- [x] Replace `StargazerError` with `ApiError` in `state-of-art-architecture.md`
- [x] Replace `StargazerError` with `ApiError` in `architecture.md`
- [x] Replace `StargazerError` with `ApiError` in `implementation-rules.md`
- [x] Replace `StargazerError` with `ApiError` in `cheat-sheet.md`
- [x] Remove `Logger` references from all docs
- [x] Same changes in Polish docs

## Test

```bash
grep -r "StargazerError" docs/
# Should only show "DON'T DO THIS" examples
grep -r "Logger" docs/
# Should return nothing
```
