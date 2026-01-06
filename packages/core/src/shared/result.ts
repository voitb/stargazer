import type { ApiError } from './error-codes';

export type Result<T, E = ApiError> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const isOk = <T, E>(
  result: Result<T, E>
): result is { readonly ok: true; readonly data: T } => result.ok;

export const isErr = <T, E>(
  result: Result<T, E>
): result is { readonly ok: false; readonly error: E } => !result.ok;

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

