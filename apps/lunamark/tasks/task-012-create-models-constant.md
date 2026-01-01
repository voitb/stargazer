---
id: task-012
title: Create MODELS constant
status: todo
priority: medium
labels:
  - core
  - gemini
created: '2026-01-01'
order: 120
---
## Description

Create the models constant and default model configuration.

## Acceptance Criteria

- [ ] Create `packages/core/src/gemini/models.ts`
- [ ] Define `MODELS` constant array
- [ ] Define `Model` type and `DEFAULT_MODEL`

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
