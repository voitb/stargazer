import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@stargazer/core/gemini/client', () => ({
  createGeminiClient: vi.fn(() => ({ generate: vi.fn() })),
}));

vi.mock('@stargazer/core/review/reviewer', () => ({
  reviewDiff: vi.fn(),
}));

import { reviewDiff } from '@stargazer/core/review/reviewer';

const mockReviewDiff = vi.mocked(reviewDiff);

describe('reviewCommand', () => {
  const originalEnv = process.env;
  const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
  const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('exits with code 2 when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const { reviewCommand } = await import('./review');
    await reviewCommand.parseAsync(['review'], { from: 'user' });

    expect(mockConsoleError).toHaveBeenCalledWith('Error: GEMINI_API_KEY environment variable is required');
    expect(mockExit).toHaveBeenCalledWith(2);
  });

  it('exits with code 0 when review passes', async () => {
    mockReviewDiff.mockResolvedValue({ ok: true, data: { issues: [], summary: '', decision: 'approve' } });
    const { reviewCommand } = await import('./review');
    await reviewCommand.parseAsync(['review'], { from: 'user' });

    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('exits with code 1 when issues are found', async () => {
    mockReviewDiff.mockResolvedValue({
      ok: true,
      data: { issues: [{ file: 'x.ts', line: 1, severity: 'high', message: 'Bug', category: 'bug', confidence: 0.9 }], summary: '', decision: 'request_changes' },
    });
    const { reviewCommand } = await import('./review');
    await reviewCommand.parseAsync(['review'], { from: 'user' });

    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('exits with code 2 on API error', async () => {
    mockReviewDiff.mockResolvedValue({ ok: false, error: { code: 'API_ERROR', message: 'Failed' } });
    const { reviewCommand } = await import('./review');
    await reviewCommand.parseAsync(['review'], { from: 'user' });

    expect(mockConsoleError).toHaveBeenCalledWith('Error: Failed');
    expect(mockExit).toHaveBeenCalledWith(2);
  });

  it('outputs JSON when --json flag is used', async () => {
    const data = { issues: [], summary: 'Clean', decision: 'approve' };
    mockReviewDiff.mockResolvedValue({ ok: true, data });
    const { reviewCommand } = await import('./review');
    await reviewCommand.parseAsync(['review', '--json'], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
  });
});
