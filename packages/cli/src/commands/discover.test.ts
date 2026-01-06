import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDiscoverCommand } from './discover';
import type { GeminiClient } from '@stargazer/core/gemini/types';

// Mock external dependencies
vi.mock('@stargazer/core/gemini/client', () => ({
  createGeminiClient: vi.fn(),
}));

vi.mock('@stargazer/core/conventions/discovery', () => ({
  discoverConventions: vi.fn(),
}));

vi.mock('@stargazer/core/conventions/cache', () => ({
  saveConventions: vi.fn(),
}));

import { createGeminiClient } from '@stargazer/core/gemini/client';
import { discoverConventions } from '@stargazer/core/conventions/discovery';
import { saveConventions } from '@stargazer/core/conventions/cache';

describe('createDiscoverCommand', () => {
  const mockConventions = {
    version: '1.0' as const,
    discoveredAt: '2025-01-06T12:00:00Z',
    language: 'typescript',
    patterns: {
      errorHandling: {
        name: 'Result Pattern',
        description: 'Uses Result<T, E>',
        examples: ['ok(data)'],
      },
    },
    summary: 'Test project',
  };

  let originalEnv: NodeJS.ProcessEnv;
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
    throw new Error('process.exit called');
  }) as () => never);

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env['GEMINI_API_KEY'] = 'test-api-key';

    vi.mocked(createGeminiClient).mockReturnValue({
      generate: vi.fn(),
    } as unknown as GeminiClient);

    vi.mocked(discoverConventions).mockResolvedValue({
      ok: true,
      data: mockConventions,
    });

    vi.mocked(saveConventions).mockResolvedValue({
      ok: true,
      data: undefined,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should create a command named "discover"', () => {
    const command = createDiscoverCommand();
    expect(command.name()).toBe('discover');
  });

  it('should have --json option', () => {
    const command = createDiscoverCommand();
    const options = command.options.map(o => o.long);
    expect(options).toContain('--json');
  });

  it('should have --max-files option', () => {
    const command = createDiscoverCommand();
    const options = command.options.map(o => o.long);
    expect(options).toContain('--max-files');
  });

  it('should exit with code 2 if GEMINI_API_KEY is not set', async () => {
    delete process.env['GEMINI_API_KEY'];

    const command = createDiscoverCommand();

    await expect(
      command.parseAsync(['discover'], { from: 'user' })
    ).rejects.toThrow('process.exit called');

    expect(processExitSpy).toHaveBeenCalledWith(2);
  });

  it('should call discoverConventions with project path', async () => {
    const command = createDiscoverCommand();

    try {
      await command.parseAsync(['discover'], { from: 'user' });
    } catch {
      // Ignore exit errors
    }

    expect(discoverConventions).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        projectPath: expect.any(String),
      })
    );
  });

  it('should save conventions after discovery', async () => {
    const command = createDiscoverCommand();

    try {
      await command.parseAsync(['discover'], { from: 'user' });
    } catch {
      // Ignore exit errors
    }

    expect(saveConventions).toHaveBeenCalled();
  });
});
