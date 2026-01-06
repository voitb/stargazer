---
id: task-012
title: Create MODELS constant
status: done
assignee: voitb
priority: medium
labels:
  - core
  - gemini
created: '2026-01-01'
order: 35
---
## Description

Create the models constant and default model configuration.

## Acceptance Criteria

- [x] Create `packages/core/src/gemini/models.ts`
- [x] Define `MODELS` constant array
- [x] Define `Model` type and `DEFAULT_MODEL`

## Implementation

**File**: `packages/core/src/gemini/models.ts`

```typescript
export const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-pro',
] as const;

export type Model = typeof MODELS[number];
export const DEFAULT_MODEL: Model = 'gemini-2.0-flash';
```

## Test

TypeScript compiles, `DEFAULT_MODEL` is valid.
