---
id: task-092
title: Add Result type utility functions
status: done
priority: low
labels:
  - core
  - shared
created: '2026-01-06'
order: 920
assignee: voitb
---
## Description

Add common utility functions for the Result type to improve ergonomics.

## Issue Details

**File**: `/packages/core/src/shared/result.ts`
**Confidence**: 75%
**Category**: Developer Experience

The Result type is missing common utility functions like `map`, `flatMap`, `unwrapOr` that make working with Result types more ergonomic.

## Acceptance Criteria

- [x] Add `map` function for transforming success values
- [x] Add `flatMap` function for chaining Result-returning operations
- [x] Add `unwrapOr` function for providing default values
- [x] Add `match` function for pattern matching
- [x] Add comprehensive tests

## Implementation

**File**: `packages/core/src/shared/result.ts`

```typescript
/**
 * Transform the success value of a Result.
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.data));
  }
  return result;
}

/**
 * Chain Result-returning operations.
 */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  if (result.ok) {
    return fn(result.data);
  }
  return result;
}

/**
 * Extract the success value or return a default.
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.ok) {
    return result.data;
  }
  return defaultValue;
}

/**
 * Pattern match on a Result.
 */
export function match<T, E, U>(
  result: Result<T, E>,
  handlers: {
    ok: (data: T) => U;
    err: (error: E) => U;
  }
): U {
  if (result.ok) {
    return handlers.ok(result.data);
  }
  return handlers.err(result.error);
}

/**
 * Collect an array of Results into a Result of array.
 * Returns the first error if any Result fails.
 */
export function collect<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const collected: T[] = [];

  for (const result of results) {
    if (!result.ok) {
      return result;
    }
    collected.push(result.data);
  }

  return ok(collected);
}
```

## Test

**File**: `packages/core/src/shared/result.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { ok, err, map, flatMap, unwrapOr, match, collect } from './result';

describe('Result utilities', () => {
  describe('map', () => {
    it('transforms success value', () => {
      const result = map(ok(5), (x) => x * 2);
      expect(result).toEqual(ok(10));
    });

    it('passes through error', () => {
      const error = { code: 'ERROR', message: 'fail' };
      const result = map(err(error), (x: number) => x * 2);
      expect(result).toEqual(err(error));
    });
  });

  describe('unwrapOr', () => {
    it('returns success value', () => {
      expect(unwrapOr(ok(5), 0)).toBe(5);
    });

    it('returns default on error', () => {
      expect(unwrapOr(err({ code: 'ERROR' }), 0)).toBe(0);
    });
  });

  // ... more tests
});
```

## Test

```bash
cd packages/core && pnpm test result.test.ts
```
