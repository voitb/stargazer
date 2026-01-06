import { describe, it, expect } from 'vitest';
import { formatReview } from './terminal';
import type { ReviewResult } from '@stargazer/core';

function stripAnsi(str: string): string {
  return str.replace(/\u001b\[[0-9;]*m/g, '');
}

describe('formatReview', () => {
  it('shows "No issues found" for clean review', () => {
    const review: ReviewResult = {
      issues: [],
      summary: 'Code looks good!',
      decision: 'approve',
    };

    const output = stripAnsi(formatReview(review));

    expect(output).toContain('No issues found!');
    expect(output).toContain('Code looks good!');
  });

  it('formats multiple issues with count and location', () => {
    const review: ReviewResult = {
      issues: [
        {
          file: 'src/index.ts',
          line: 10,
          severity: 'high',
          category: 'bug',
          message: 'Potential null reference',
          confidence: 0.9,
        },
        {
          file: 'src/utils.ts',
          line: 25,
          severity: 'low',
          category: 'convention',
          message: 'Inconsistent naming',
          suggestion: 'Use camelCase',
          confidence: 0.8,
        },
      ],
      summary: 'Found some issues',
      decision: 'request_changes',
    };

    const output = stripAnsi(formatReview(review));

    expect(output).toContain('Found 2 issue(s)');
    expect(output).toContain('src/index.ts:10');
    expect(output).toContain('[HIGH]');
    expect(output).toContain('src/utils.ts:25');
    expect(output).toContain('[LOW]');
    expect(output).toContain('Use camelCase');
  });

  it('shows decision icons', () => {
    const makeReview = (decision: 'approve' | 'request_changes' | 'comment'): ReviewResult => ({
      issues: [],
      summary: 'Test',
      decision,
    });

    expect(formatReview(makeReview('approve'))).toContain('✅');
    expect(formatReview(makeReview('request_changes'))).toContain('🔴');
    expect(formatReview(makeReview('comment'))).toContain('💬');
  });

  it('omits lightbulb when no suggestion', () => {
    const review: ReviewResult = {
      issues: [
        { file: 'test.ts', line: 1, severity: 'high', category: 'bug', message: 'Bug found', confidence: 0.9 },
      ],
      summary: 'Bug',
      decision: 'request_changes',
    };

    expect(formatReview(review)).not.toContain('💡');
  });
});
