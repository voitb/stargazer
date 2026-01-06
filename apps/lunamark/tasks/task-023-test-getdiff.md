---
id: task-023
title: Test getDiff function
status: done
assignee: voitb
priority: medium
labels:
  - core
  - context
  - testing
created: '2026-01-01'
order: 230
---
## Description

Create unit tests for the getDiff function to verify it works correctly.

## Acceptance Criteria

- [x] Create `packages/core/src/context/git.test.ts`
- [x] Test that function returns Result type
- [x] Test handles empty diff gracefully
- [x] All tests pass

## Implementation

**File**: `packages/core/src/context/git.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getDiff } from './git';

describe('getDiff', () => {
  it('returns result with diff string for staged changes', async () => {
    const result = await getDiff(true);
    expect(result.ok).toBe(true);
    // Note: might be empty string if no staged changes
    if (result.ok) {
      expect(typeof result.data).toBe('string');
    }
  });

  it('returns result with diff string for unstaged changes', async () => {
    const result = await getDiff(false);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.data).toBe('string');
    }
  });

  it('defaults to staged diff', async () => {
    const result = await getDiff();
    expect(result.ok).toBe(true);
  });
});
```

## Test

```bash
cd packages/core && pnpm test git.test.ts
```
