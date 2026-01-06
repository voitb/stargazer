import { describe, it, expect } from 'vitest';
import { ReviewResultSchema, IssueSchema } from './schemas';

describe('ReviewResultSchema', () => {
  it('parses valid issue data', () => {
    const issue = IssueSchema.parse({
      file: 'src/main.ts',
      line: 10,
      severity: 'high',
      category: 'bug',
      message: 'Missing null check',
      confidence: 0.9,
    });

    expect(issue.file).toBe('src/main.ts');
    expect(issue.severity).toBe('high');
  });

  it('parses valid review result', () => {
    const result = ReviewResultSchema.parse({
      issues: [],
      summary: 'No issues found',
      decision: 'approve',
    });

    expect(result.decision).toBe('approve');
    expect(result.issues).toHaveLength(0);
  });
});
