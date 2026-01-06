import { describe, it, expect } from 'vitest';
import * as z from 'zod';
import {
  ConventionPatternSchema,
  ProjectConventionsSchema,
} from './schemas';

describe('Convention Schemas', () => {
  describe('ConventionPatternSchema', () => {
    it('should validate valid pattern', () => {
      const valid = {
        name: 'Error Handling',
        description: 'Use Result types',
        examples: ['ok(data)', 'err(error)'],
      };

      const result = ConventionPatternSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalid = {
        name: 'Error Handling',
      };

      const result = ConventionPatternSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject non-string examples', () => {
      const invalid = {
        name: 'Error Handling',
        description: 'Use Result types',
        examples: [123, 456],
      };

      const result = ConventionPatternSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('ProjectConventionsSchema', () => {
    it('should validate complete conventions', () => {
      const valid = {
        version: '1.0',
        discoveredAt: '2025-01-06T12:00:00Z',
        language: 'typescript',
        patterns: {
          errorHandling: {
            name: 'Result Pattern',
            description: 'Use Result<T, E>',
            examples: ['ok(data)'],
          },
        },
        summary: 'TypeScript with Result pattern',
      };

      const result = ProjectConventionsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should allow empty patterns', () => {
      const valid = {
        version: '1.0',
        discoveredAt: '2025-01-06T12:00:00Z',
        language: 'javascript',
        patterns: {},
        summary: 'No patterns detected',
      };

      const result = ProjectConventionsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid version', () => {
      const invalid = {
        version: '2.0',
        discoveredAt: '2025-01-06T12:00:00Z',
        language: 'typescript',
        patterns: {},
        summary: 'Test',
      };

      const result = ProjectConventionsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should generate valid OpenAPI 3.0 JSON Schema', () => {
      const jsonSchema = z.toJSONSchema(ProjectConventionsSchema, {
        target: 'openapi-3.0',
      });

      expect(jsonSchema).toBeDefined();
      expect(jsonSchema.type).toBe('object');
      expect(jsonSchema.properties).toHaveProperty('version');
      expect(jsonSchema.properties).toHaveProperty('patterns');
    });
  });
});
