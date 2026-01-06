import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr } from './result';

describe('Result utilities', () => {
  it('ok() creates success result with data', () => {
    const result = ok({ id: 1, name: 'test' });
    expect(result).toEqual({ ok: true, data: { id: 1, name: 'test' } });
  });

  it('err() creates error result with error object', () => {
    const error = { code: 'NOT_FOUND', message: 'Resource not found' };
    const result = err(error);
    expect(result).toEqual({ ok: false, error });
  });

  it('isOk() returns true for success, false for error', () => {
    expect(isOk(ok('data'))).toBe(true);
    expect(isOk(err({ code: 'ERR', message: 'fail' }))).toBe(false);
  });

  it('isErr() returns true for error, false for success', () => {
    expect(isErr(err({ code: 'ERR', message: 'fail' }))).toBe(true);
    expect(isErr(ok('data'))).toBe(false);
  });
});
