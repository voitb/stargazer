import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { saveConventions, loadConventions } from './cache';
import type { ProjectConventions } from './types';

describe('Convention Cache', () => {
  let testDir: string;

  const testConventions: ProjectConventions = {
    version: '1.0',
    discoveredAt: '2025-01-06T12:00:00Z',
    language: 'typescript',
    patterns: {
      errorHandling: {
        name: 'Result Pattern',
        description: 'Use Result<T, E>',
        examples: ['ok(data)', 'err(error)'],
      },
    },
    summary: 'Test conventions',
  };

  beforeEach(async () => {
    testDir = join(tmpdir(), `stargazer-cache-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('saveConventions', () => {
    it('should save conventions to .stargazer/conventions.json', async () => {
      const result = await saveConventions(testDir, testConventions);

      expect(result.ok).toBe(true);

      // Verify file was created
      const content = await readFile(
        join(testDir, '.stargazer/conventions.json'),
        'utf-8'
      );
      const saved = JSON.parse(content);

      expect(saved.version).toBe('1.0');
      expect(saved.language).toBe('typescript');
    });

    it('should create .stargazer directory if it does not exist', async () => {
      const result = await saveConventions(testDir, testConventions);

      expect(result.ok).toBe(true);

      // Directory should exist
      const content = await readFile(
        join(testDir, '.stargazer/conventions.json'),
        'utf-8'
      );
      expect(content).toBeDefined();
    });

    it('should overwrite existing conventions', async () => {
      // Save first version
      await saveConventions(testDir, testConventions);

      // Save updated version
      const updated: ProjectConventions = {
        ...testConventions,
        summary: 'Updated conventions',
      };
      await saveConventions(testDir, updated);

      const content = await readFile(
        join(testDir, '.stargazer/conventions.json'),
        'utf-8'
      );
      const saved = JSON.parse(content);

      expect(saved.summary).toBe('Updated conventions');
    });
  });

  describe('loadConventions', () => {
    it('should load saved conventions', async () => {
      await saveConventions(testDir, testConventions);

      const result = await loadConventions(testDir);

      expect(result.ok).toBe(true);
      if (result.ok && result.data) {
        expect(result.data.version).toBe('1.0');
        expect(result.data.language).toBe('typescript');
        expect(result.data.patterns.errorHandling?.name).toBe('Result Pattern');
      }
    });

    it('should return null if no cache exists', async () => {
      const result = await loadConventions(testDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBeNull();
      }
    });

    it('should return error for invalid JSON', async () => {
      // Create invalid JSON file
      await mkdir(join(testDir, '.stargazer'), { recursive: true });
      const { writeFile } = await import('node:fs/promises');
      await writeFile(
        join(testDir, '.stargazer/conventions.json'),
        'not valid json {'
      );

      const result = await loadConventions(testDir);

      expect(result.ok).toBe(false);
    });

    it('should return error for invalid schema', async () => {
      // Create file with wrong schema
      await mkdir(join(testDir, '.stargazer'), { recursive: true });
      const { writeFile } = await import('node:fs/promises');
      await writeFile(
        join(testDir, '.stargazer/conventions.json'),
        JSON.stringify({ version: '2.0', invalid: true })
      );

      const result = await loadConventions(testDir);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('SCHEMA_VALIDATION');
      }
    });
  });

  describe('round-trip', () => {
    it('should save and load conventions without data loss', async () => {
      await saveConventions(testDir, testConventions);
      const result = await loadConventions(testDir);

      expect(result.ok).toBe(true);
      if (result.ok && result.data) {
        expect(result.data).toEqual(testConventions);
      }
    });
  });
});
