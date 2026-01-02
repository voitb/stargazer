---
id: task-009
title: Create isOk() and isErr() guards
status: done
priority: high
labels:
  - core
  - helpers
created: '2026-01-01'
order: 90
---
## Description

Create type guard functions for narrowing Result types.

## Acceptance Criteria

- [x] Add `isOk()` and `isErr()` to `packages/core/src/shared/result.ts`
- [x] Type narrowing works correctly after guard
- [ ] Add unit tests

## Implementation

**File**: `packages/core/src/shared/result.ts` (extend)

```typescript
export const isOk = <T, E>(r: Result<T, E>): r is { ok: true; data: T } => r.ok;
export const isErr = <T, E>(r: Result<T, E>): r is { ok: false; error: E } => !r.ok;
```

**Test file**: `packages/core/src/shared/result.test.ts` (extend)

```typescript
import { ok, err, isOk, isErr } from './result';

describe('isOk', () => {
  it('narrows type correctly', () => {
    const result = ok(42);
    if (isOk(result)) {
      expect(result.data).toBe(42);
    }
  });
});

describe('isErr', () => {
  it('narrows type correctly', () => {
    const result = err({ code: 'API_ERROR', message: 'Failed' });
    if (isErr(result)) {
      expect(result.error.code).toBe('API_ERROR');
    }
  });
});
```

## Test

```bash
cd packages/core
pnpm test result.test.ts
```
