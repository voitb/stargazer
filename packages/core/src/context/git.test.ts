import { describe, it, expect } from 'vitest';
import { getDiff } from './git';

describe('getDiff', () => {
  it('returns result with diff string for staged changes', async () => {
    const result = await getDiff(true);
    expect(result.ok).toBe(true);
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
