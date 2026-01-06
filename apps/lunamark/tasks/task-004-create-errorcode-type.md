---
id: task-004
title: Create ErrorCode type
status: done
assignee: voitb
priority: high
labels:
  - core
  - types
created: '2026-01-01'
order: 20000
---
## Description

Create the `ErrorCode` type that defines all possible error codes.

## Acceptance Criteria

- [x] Create `packages/core/src/shared/error-codes.ts`
- [x] Define `ErrorCode` union type
- [x] TypeScript compiles

## Implementation

**File**: `packages/core/src/shared/error-codes.ts`

```typescript
export type ErrorCode =
  | 'API_ERROR'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'BAD_REQUEST'
  | 'EMPTY_RESPONSE'
  | 'SCHEMA_VALIDATION'
  | 'CONFIG_INVALID'
  | 'GIT_ERROR'
  | 'TIMEOUT'
  | 'FILE_NOT_FOUND';
```

## Test

```bash
cd packages/core
pnpm tsc --noEmit
# Should compile without errors
```
