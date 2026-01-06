import { err } from './result';
import type { Result } from './result';
import type { ApiError } from './error-codes';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type RetryOptions = {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: ApiError) => boolean;
  onRetry?: (attempt: number, delay: number, error: ApiError) => void;
};

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

    if (result.ok) {
      return result;
    }

    lastError = result.error;

    if (!shouldRetry(result.error) || attempt === maxRetries) {
      return result;
    }

    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.3 * exponentialDelay;
    const delay = Math.min(exponentialDelay + jitter, maxDelay);

    if (onRetry) {
      onRetry(attempt + 1, delay, result.error);
    }

    await sleep(delay);
  }

  return err(lastError!);
}

function defaultShouldRetry(error: ApiError): boolean {
  return error.code === 'RATE_LIMITED';
}
