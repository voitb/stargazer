---
id: task-005
title: Create ApiError type
status: done
priority: high
labels:
  - core
  - types
created: '2026-01-01'
order: 15000
---
## Description

Create the simple `ApiError` type for error handling.

## Acceptance Criteria

- [x] Add `ApiError` type to `packages/core/src/shared/error-codes.ts`
- [x] TypeScript compiles

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
