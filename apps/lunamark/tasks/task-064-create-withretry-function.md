---
id: task-064
title: Create withRetry function
status: todo
priority: medium
labels:
  - core
  - shared
created: '2026-01-01'
order: 640
---
## Description

Create a retry utility for handling rate limits and transient errors.

## Acceptance Criteria

- [ ] Create `packages/core/src/shared/retry.ts`
- [ ] Implement `withRetry()` function
- [ ] Support exponential backoff
- [ ] Configurable retry conditions

## Implementation

**File**: `packages/core/src/shared/retry.ts`

```typescript
import { err } from './result';
import type { Result } from './result';
import type { ApiError } from './error-codes';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type RetryOptions = {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds (default: 1000) */
  baseDelay?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Function to determine if error should be retried */
  shouldRetry?: (error: ApiError) => boolean;
  /** Called before each retry with attempt number and delay */
  onRetry?: (attempt: number, delay: number, error: ApiError) => void;
};

/**
 * Wraps a function with retry logic and exponential backoff.
 *
 * @example
 * const result = await withRetry(
 *   () => client.generate(prompt, schema),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<Result<T>>,
  options: RetryOptions = {}
): Promise<Result<T>> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options;

  let lastError: ApiError | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await fn();

    // Success - return immediately
    if (result.ok) {
      return result;
    }

    lastError = result.error;

    // Check if we should retry
    if (!shouldRetry(result.error) || attempt === maxRetries) {
      return result;
    }

    // Calculate delay with exponential backoff and jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.3 * exponentialDelay; // Add up to 30% jitter
    const delay = Math.min(exponentialDelay + jitter, maxDelay);

    // Notify about retry
    if (onRetry) {
      onRetry(attempt + 1, delay, result.error);
    }

    await sleep(delay);
  }

  // Should not reach here, but just in case
  return err(lastError!);
}

/**
 * Default retry condition - only retry on rate limits.
 */
function defaultShouldRetry(error: ApiError): boolean {
  return error.code === 'RATE_LIMITED';
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
