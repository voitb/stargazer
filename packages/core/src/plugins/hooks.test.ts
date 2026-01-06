import { describe, it, expect } from 'vitest';
import { runBeforeReviewHooks, runFilterHooks } from './hooks';
import type { StargazerPlugin, ReviewContext } from './types';
import type { Issue } from '../review/types';

describe('runBeforeReviewHooks', () => {
  it('runs plugins in sequence', async () => {
    const order: number[] = [];

    const plugins: StargazerPlugin[] = [
      {
        name: 'plugin-1',
        beforeReview: () => {
          order.push(1);
        },
      },
      {
        name: 'plugin-2',
        beforeReview: () => {
          order.push(2);
        },
      },
    ];

    const initialCtx: ReviewContext = {
      diff: 'test diff',
      projectPath: '/test',
    };

    await runBeforeReviewHooks(plugins, initialCtx);

    expect(order).toEqual([1, 2]);
  });

  it('handles async hooks', async () => {
    const plugins: StargazerPlugin[] = [
      {
        name: 'async-plugin',
        beforeReview: async () => {
          await new Promise((r) => setTimeout(r, 10));
        },
      },
    ];

    const initialCtx: ReviewContext = {
      diff: 'original',
      projectPath: '/test',
    };

    await runBeforeReviewHooks(plugins, initialCtx);
    // Test passes if no error is thrown
    expect(true).toBe(true);
  });

  it('skips plugins without the hook', async () => {
    const plugins: StargazerPlugin[] = [
      { name: 'no-hook' },
      {
        name: 'has-hook',
        beforeReview: () => {
          // Side effect hook
        },
      },
    ];

    const initialCtx: ReviewContext = {
      diff: 'original',
      projectPath: '/test',
    };

    await runBeforeReviewHooks(plugins, initialCtx);
    // Test passes if no error is thrown
    expect(true).toBe(true);
  });
});

describe('runFilterHooks', () => {
  const createIssue = (file: string, severity: 'low' | 'medium' | 'high'): Issue => ({
    file,
    line: 1,
    severity,
    category: 'bug',
    message: 'Test issue',
    confidence: 0.9,
  });

  it('filters issues through plugins', () => {
    const plugins: StargazerPlugin[] = [
      {
        name: 'filter-low',
        filterIssues: (issues) => issues.filter((i) => i.severity !== 'low'),
      },
      {
        name: 'filter-test-files',
        filterIssues: (issues) =>
          issues.filter((i) => !i.file.includes('.test.')),
      },
    ];

    const issues: Issue[] = [
      createIssue('src/app.ts', 'high'),
      createIssue('src/app.ts', 'low'),
      createIssue('src/app.test.ts', 'high'),
    ];

    const ctx: ReviewContext = {
      diff: 'test',
      projectPath: '/test',
    };

    const result = runFilterHooks(plugins, issues, ctx);

    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('src/app.ts');
    expect(result[0].severity).toBe('high');
  });
});
