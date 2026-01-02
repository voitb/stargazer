import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, type Result } from './result';
import type { ApiError } from './error-codes';

describe('ok', () => {
  it('creates success result with number', () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBe(42);
    }
  });

  it('creates success result with object', () => {
    const result = ok({ name: 'John', age: 30 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ name: 'John', age: 30 });
    }
  });

  it('creates success result with null', () => {
    const result = ok(null);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBe(null);
    }
  });
});

describe('err', () => {
  it('creates error result with ApiError', () => {
    const error: ApiError = { code: 'API_ERROR', message: 'Failed to connect' };
    const result = err(error);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('API_ERROR');
      expect(result.error.message).toBe('Failed to connect');
    }
  });

  it('creates error result with cause', () => {
    const originalError = new Error('Network failure');
    const error: ApiError = {
      code: 'API_ERROR',
      message: 'Failed to connect',
      cause: originalError,
    };
    const result = err(error);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.cause).toBe(originalError);
    }
  });

  it('creates error result with different error codes', () => {
    const rateLimited = err({ code: 'RATE_LIMITED' as const, message: 'Too many requests' });
    const unauthorized = err({ code: 'UNAUTHORIZED' as const, message: 'Invalid API key' });

    if (!rateLimited.ok) {
      expect(rateLimited.error.code).toBe('RATE_LIMITED');
    }
    if (!unauthorized.ok) {
      expect(unauthorized.error.code).toBe('UNAUTHORIZED');
    }
  });
});

describe('isOk', () => {
  it('returns true for success result', () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
  });

  it('returns false for error result', () => {
    const result = err({ code: 'API_ERROR', message: 'Failed' });
    expect(isOk(result)).toBe(false);
  });

  it('narrows type correctly', () => {
    const result: Result<number> = ok(42);
    if (isOk(result)) {
      const data: number = result.data;
      expect(data).toBe(42);
    }
  });
});

describe('isErr', () => {
  it('returns true for error result', () => {
    const result = err({ code: 'API_ERROR', message: 'Failed' });
    expect(isErr(result)).toBe(true);
  });

  it('returns false for success result', () => {
    const result = ok(42);
    expect(isErr(result)).toBe(false);
  });

  it('narrows type correctly', () => {
    const result: Result<number> = err({ code: 'API_ERROR', message: 'Failed' });
    if (isErr(result)) {
      const code: string = result.error.code;
      expect(code).toBe('API_ERROR');
    }
  });
});

describe('Result type inference', () => {
  it('infers correct type from ok()', () => {
    const result = ok({ id: 1, name: 'Test' });
    if (result.ok) {
      expect(result.data.id).toBe(1);
      expect(result.data.name).toBe('Test');
    }
  });

  it('works with async functions', async () => {
    async function fetchData(): Promise<Result<string>> {
      return ok('success');
    }

    const result = await fetchData();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBe('success');
    }
  });

  it('chains error handling', () => {
    function step1(): Result<number> {
      return ok(1);
    }

    function step2(input: number): Result<string> {
      if (input > 0) {
        return ok(`Value: ${input}`);
      }
      return err({ code: 'BAD_REQUEST', message: 'Input must be positive' });
    }

    const result1 = step1();
    if (!result1.ok) {
      expect.fail('step1 should succeed');
      return;
    }

    const result2 = step2(result1.data);
    expect(result2.ok).toBe(true);
    if (result2.ok) {
      expect(result2.data).toBe('Value: 1');
    }
  });
});
