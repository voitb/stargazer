---
id: task-019
title: Create ReviewDecision enum
status: todo
priority: high
labels:
  - core
  - review
  - schemas
created: '2026-01-01'
order: 190
---
## Description

Create the review decision enum schema.

## Acceptance Criteria

- [ ] Add `DECISIONS` and `DecisionSchema` to `schemas.ts`
- [ ] Export `Decision` type

## Implementation

**File**: `packages/core/src/review/schemas.ts` (extend)

```typescript
export const DECISIONS = ['approve', 'request_changes', 'comment'] as const;
export const DecisionSchema = z.enum(DECISIONS).describe('Review decision');
export type Decision = z.infer<typeof DecisionSchema>;
```

## Test

TypeScript compiles.
