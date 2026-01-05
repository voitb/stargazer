import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@stargazer/core/gemini/client', () => ({
  createGeminiClient: vi.fn(() => ({
    generate: vi.fn(),
  })),
}));

vi.mock('@stargazer/core/review/reviewer', () => ({
  reviewDiff: vi.fn(),
}));

import { createGeminiClient } from '@stargazer/core/gemini/client';
import { reviewDiff } from '@stargazer/core/review/reviewer';

const mockCreateGeminiClient = vi.mocked(createGeminiClient);
const mockReviewDiff = vi.mocked(reviewDiff);

describe('reviewCommand', () => {
  const originalEnv = process.env;
  const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
  const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('exits with code 2 when GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY;

    const { reviewCommand } = await import('./review');
    await reviewCommand.parseAsync(['review'], { from: 'user' });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error: GEMINI_API_KEY environment variable is required'
    );
    expect(mockExit).toHaveBeenCalledWith(2);
  });

  it('calls reviewDiff with staged=true by default', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockReviewDiff.mockResolvedValue({
      ok: true,
      data: { issues: [], summary: 'No issues', decision: 'approve' },
    });

    vi.resetModules();
    const { reviewCommand } = await import('./review');
    await reviewCommand.parseAsync(['review'], { from: 'user' });

    expect(mockReviewDiff).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ staged: true })
    );
  });

  it('calls reviewDiff with staged=false when --unstaged passed', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockReviewDiff.mockResolvedValue({
      ok: true,
      data: { issues: [], summary: 'No issues', decision: 'approve' },
    });

    vi.resetModules();
    const { reviewCommand } = await import('./review');
    await reviewCommand.parseAsync(['review', '--unstaged'], { from: 'user' });

    expect(mockReviewDiff).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ staged: false })
    );
  });

  it('outputs JSON when --json flag is used', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const mockData = { issues: [], summary: 'Clean code', decision: 'approve' };
    mockReviewDiff.mockResolvedValue({ ok: true, data: mockData });

    vi.resetModules();
    const { reviewCommand } = await import('./review');
    await reviewCommand.parseAsync(['review', '--json'], { from: 'user' });

    expect(mockConsoleLog).toHaveBeenCalledWith(JSON.stringify(mockData, null, 2));
  });

  it('exits with code 0 when no issues found', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockReviewDiff.mockResolvedValue({
      ok: true,
      data: { issues: [], summary: 'No issues', decision: 'approve' },
    });

    vi.resetModules();
    const { reviewCommand } = await import('./review');
    await reviewCommand.parseAsync(['review'], { from: 'user' });

    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('exits with code 1 when issues are found', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockReviewDiff.mockResolvedValue({
      ok: true,
      data: {
        issues: [{ file: 'test.ts', line: 1, severity: 'high', message: 'Issue', category: 'bug', confidence: 0.9 }],
        summary: 'Found issue',
        decision: 'request_changes',
      },
    });

    vi.resetModules();
    const { reviewCommand } = await import('./review');
    await reviewCommand.parseAsync(['review'], { from: 'user' });

    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('exits with code 2 on reviewDiff error', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockReviewDiff.mockResolvedValue({
      ok: false,
      error: { code: 'API_ERROR', message: 'API call failed' },
    });

    vi.resetModules();
    const { reviewCommand } = await import('./review');
    await reviewCommand.parseAsync(['review'], { from: 'user' });

    expect(mockConsoleError).toHaveBeenCalledWith('Error: API call failed');
    expect(mockExit).toHaveBeenCalledWith(2);
  });
});
