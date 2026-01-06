import { describe, it, expect } from 'vitest';
import type {
  ConventionPattern,
  ConventionCategory,
  ProjectConventions,
  FileContext,
} from './types';

describe('Convention Types', () => {
  describe('ConventionPattern', () => {
    it('should accept valid convention pattern', () => {
      const pattern: ConventionPattern = {
        name: 'Result Pattern',
        description: 'Use Result<T, E> for error handling',
        examples: ['const result = ok(data);', 'if (!result.ok) return;'],
      };

      expect(pattern.name).toBe('Result Pattern');
      expect(pattern.examples).toHaveLength(2);
    });
  });

  describe('ConventionCategory', () => {
    it('should accept valid categories', () => {
      const categories: ConventionCategory[] = [
        'errorHandling',
        'naming',
        'testing',
        'imports',
      ];

      expect(categories).toHaveLength(4);
    });
  });

  describe('ProjectConventions', () => {
    it('should accept valid project conventions', () => {
      const conventions: ProjectConventions = {
        version: '1.0',
        discoveredAt: '2025-01-06T12:00:00Z',
        language: 'typescript',
        patterns: {
          errorHandling: {
            name: 'Result Pattern',
            description: 'Use Result type',
            examples: ['ok(data)', 'err(error)'],
          },
        },
        summary: 'TypeScript project using Result pattern',
      };

      expect(conventions.version).toBe('1.0');
      expect(conventions.patterns.errorHandling?.name).toBe('Result Pattern');
    });

    it('should allow empty patterns object', () => {
      const conventions: ProjectConventions = {
        version: '1.0',
        discoveredAt: '2025-01-06T12:00:00Z',
        language: 'javascript',
        patterns: {},
        summary: 'No clear patterns detected',
      };

      expect(conventions.patterns).toEqual({});
    });
  });

  describe('FileContext', () => {
    it('should accept valid file context', () => {
      const file: FileContext = {
        path: 'src/utils/helpers.ts',
        content: 'export function helper() {}',
      };

      expect(file.path).toBe('src/utils/helpers.ts');
      expect(file.content).toContain('export');
    });
  });
});
