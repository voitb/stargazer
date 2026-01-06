import { describe, it, expect } from 'vitest';
import { IssueSchema } from './schemas';

describe('IssueSchema with conventionRef', () => {
  it('should accept issue without conventionRef', () => {
    const issue = {
      file: 'src/app.ts',
      line: 10,
      severity: 'high',
      category: 'bug',
      message: 'Potential null pointer',
      confidence: 0.9,
    };

    const result = IssueSchema.safeParse(issue);
    expect(result.success).toBe(true);
  });

  it('should accept issue with conventionRef', () => {
    const issue = {
      file: 'src/app.ts',
      line: 10,
      severity: 'medium',
      category: 'convention',
      message: 'Should use Result type for error handling',
      conventionRef: 'errorHandling',
      confidence: 0.85,
    };

    const result = IssueSchema.safeParse(issue);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.conventionRef).toBe('errorHandling');
    }
  });

  it('should accept any convention category as conventionRef', () => {
    const categories = ['errorHandling', 'naming', 'testing', 'imports'];

    for (const category of categories) {
      const issue = {
        file: 'test.ts',
        line: 1,
        severity: 'low',
        category: 'convention',
        message: 'Convention violation',
        conventionRef: category,
        confidence: 0.7,
      };

      const result = IssueSchema.safeParse(issue);
      expect(result.success).toBe(true);
    }
  });

  it('should allow conventionRef to be undefined', () => {
    const issue = {
      file: 'src/app.ts',
      line: 10,
      severity: 'critical',
      category: 'security',
      message: 'SQL injection vulnerability',
      conventionRef: undefined,
      confidence: 0.95,
    };

    const result = IssueSchema.safeParse(issue);
    expect(result.success).toBe(true);
  });
});
