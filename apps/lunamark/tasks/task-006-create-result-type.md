---
id: task-006
title: Create Result type
status: done
priority: high
labels:
  - core
  - types
created: '2026-01-01'
order: 17500
---
## Description

Create the `Result<T, E>` tagged union type for functional error handling.

## Acceptance Criteria

- [x] Create `packages/core/src/shared/result.ts`
- [x] Define `Result<T, E>` type
- [x] TypeScript compiles with correct type inference

## Implementation

**File**: `packages/core/src/shared/result.ts`

```typescript
import type { ApiError } from './error-codes';

export type Result<T, E = ApiError> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: E };
```

## Test

```typescript
// Type inference works:
const success: Result<number> = { ok: true, data: 42 };
const error: Result<number> = { ok: false, error: { code: 'API_ERROR', message: 'Failed' } };
```
