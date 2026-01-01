---
id: task-008
title: Create err() helper
status: todo
priority: high
labels:
  - core
  - helpers
created: '2026-01-01'
order: 80
---
## Description

Create the `err()` helper function for creating error results.

## Acceptance Criteria

- [ ] Add `err()` to `packages/core/src/shared/result.ts`
- [ ] Add unit test
- [ ] Test passes

## Implementation

**File**: `packages/core/src/shared/result.ts` (extend)

```typescript
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
```

**Test file**: `packages/core/src/shared/result.test.ts` (extend)

```typescript
import { err } from './result';

describe('err', () => {
  it('creates error result', () => {
    const result = err({ code: 'API_ERROR', message: 'Failed' });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('API_ERROR');
  });
});
```

## Test

```bash
cd packages/core
pnpm test result.test.ts
```
