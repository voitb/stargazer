---
id: task-003
title: Add @google/genai dependency
status: done
priority: high
labels:
  - setup
  - dependencies
created: '2026-01-01'
order: 37.5
---
## Description

Add the Google GenAI SDK to the core package.

## Acceptance Criteria

- [x] Install `@google/genai` in `packages/core`

## Implementation

```bash
cd packages/core
pnpm add @google/genai
```

## Test

```bash
pnpm list @google/genai
# Should show installed version
```
