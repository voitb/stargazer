---
id: task-005
title: Create ApiError type
status: todo
priority: high
labels:
  - core
  - types
created: '2026-01-01'
order: 50
---
## Description

Create the simple `ApiError` type for error handling.

## Acceptance Criteria

- [ ] Add `ApiError` type to `packages/core/src/shared/error-codes.ts`
- [ ] TypeScript compiles

## Implementation

**File**: `packages/core/src/shared/error-codes.ts` (extend)

```typescript
export type ApiError = {
  readonly code: ErrorCode;
  readonly message: string;
  readonly cause?: unknown;
};
```

## Test

```bash
cd packages/core
pnpm tsc --noEmit
# Should compile without errors
```
