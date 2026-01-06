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

    const promise = withRetry(fn, {
      baseDelay: 100,
      shouldRetry: (e) => e.code === 'API_ERROR',
      maxRetries: 1,
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.ok).toBe(false);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
