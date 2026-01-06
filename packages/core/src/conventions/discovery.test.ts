import { describe, it, expect, vi, beforeEach } from 'vitest';
import { discoverConventions } from './discovery';
import type { GeminiClient } from '../gemini/types';
import type { ProjectConventions } from './types';

// Mock file-reader module
vi.mock('./file-reader', () => ({
  readProjectFiles: vi.fn(),
}));

import { readProjectFiles } from './file-reader';

describe('discoverConventions', () => {
  const mockConventions: ProjectConventions = {
    version: '1.0',
    discoveredAt: '2025-01-06T12:00:00Z',
    language: 'typescript',
    patterns: {
      errorHandling: {
        name: 'Result Pattern',
        description: 'Uses Result<T, E> for error handling',
        examples: ['ok(data)', 'err(error)'],
      },
    },
    summary: 'TypeScript project with Result pattern',
  };

  let mockClient: GeminiClient;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      generate: vi.fn().mockResolvedValue({
        ok: true,
        data: mockConventions,
      }),
    } as unknown as GeminiClient;
  });

  it('should discover conventions successfully', async () => {
    vi.mocked(readProjectFiles).mockResolvedValue({
      ok: true,
      data: [
        { path: 'src/app.ts', content: 'export const app = true;' },
      ],
    });

    const result = await discoverConventions(mockClient, {
      projectPath: '/test/project',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.version).toBe('1.0');
      expect(result.data.patterns.errorHandling?.name).toBe('Result Pattern');
    }
  });

  it('should return error when no files found', async () => {
    vi.mocked(readProjectFiles).mockResolvedValue({
      ok: true,
      data: [],
    });

    const result = await discoverConventions(mockClient, {
      projectPath: '/empty/project',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('FILE_NOT_FOUND');
    }
  });

  it('should propagate file read errors', async () => {
    vi.mocked(readProjectFiles).mockResolvedValue({
      ok: false,
      error: { code: 'FILE_NOT_FOUND', message: 'Directory not found' },
    });

    const result = await discoverConventions(mockClient, {
      projectPath: '/nonexistent',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('FILE_NOT_FOUND');
    }
  });

  it('should propagate Gemini API errors', async () => {
    vi.mocked(readProjectFiles).mockResolvedValue({
      ok: true,
      data: [{ path: 'test.ts', content: 'const x = 1;' }],
    });

    mockClient.generate = vi.fn().mockResolvedValue({
      ok: false,
      error: { code: 'API_ERROR', message: 'Rate limited' },
    });

    const result = await discoverConventions(mockClient, {
      projectPath: '/test',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('API_ERROR');
    }
  });

  it('should respect maxFiles option', async () => {
    vi.mocked(readProjectFiles).mockResolvedValue({
      ok: true,
      data: [{ path: 'test.ts', content: 'const x = 1;' }],
    });

    await discoverConventions(mockClient, {
      projectPath: '/test',
      maxFiles: 25,
    });

    expect(readProjectFiles).toHaveBeenCalledWith('/test', 25);
  });
});
