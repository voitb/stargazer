---
id: task-065
title: Test withRetry
status: todo
priority: medium
labels:
  - core
  - shared
  - testing
created: '2026-01-01'
order: 650
---
## Description

Create unit tests for the withRetry function.

## Acceptance Criteria

- [ ] Create `packages/core/src/shared/retry.test.ts`
- [ ] Test successful on first attempt
- [ ] Test retry on RATE_LIMITED
- [ ] Test no retry on other errors
- [ ] Test max retries limit

## Implementation

**File**: `packages/core/src/shared/retry.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry } from './retry';
import { ok, err } from './result';
import type { ApiError } from './error-codes';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns success immediately on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue(ok('success'));

    const promise = withRetry(fn, { baseDelay: 100 });
    const result = await promise;

    expect(result.ok).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on RATE_LIMITED error', async () => {
    let attempts = 0;
    const fn = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 3) {
        return err({ code: 'RATE_LIMITED', message: 'Too many requests' } as ApiError);
      }
      return ok('success');
    });

    const promise = withRetry(fn, { baseDelay: 100 });

    // Fast-forward through all delays
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.ok).toBe(true);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry on non-retryable errors', async () => {
    const fn = vi.fn().mockResolvedValue(
      err({ code: 'UNAUTHORIZED', message: 'Bad key' } as ApiError)
    );

    const result = await withRetry(fn, { baseDelay: 100 });

    expect(result.ok).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('respects maxRetries limit', async () => {
    const fn = vi.fn().mockResolvedValue(
      err({ code: 'RATE_LIMITED', message: 'Too many requests' } as ApiError)
    );

    const promise = withRetry(fn, { maxRetries: 2, baseDelay: 100 });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.ok).toBe(false);
    // 1 initial + 2 retries = 3 total
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('calls onRetry callback before each retry', async () => {
    let attempts = 0;
    const fn = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 2) {
        return err({ code: 'RATE_LIMITED', message: 'Retry' } as ApiError);
      }
      return ok('success');
    });

    const onRetry = vi.fn();

    const promise = withRetry(fn, { baseDelay: 100, onRetry });

    await vi.runAllTimersAsync();
    await promise;

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(
      1,
      expect.any(Number),
      expect.objectContaining({ code: 'RATE_LIMITED' })
    );
  });

  it('uses custom shouldRetry function', async () => {
    const fn = vi.fn().mockResolvedValue(
      err({ code: 'API_ERROR', message: 'Server error' } as ApiError)
    );

    const result = await withRetry(fn, {
      baseDelay: 100,
      shouldRetry: (e) => e.code === 'API_ERROR',
      maxRetries: 1,
    });

    expect(result.ok).toBe(false);
    // Should retry once for API_ERROR
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
```

## Test

```bash
cd packages/core && pnpm test retry.test.ts
```
