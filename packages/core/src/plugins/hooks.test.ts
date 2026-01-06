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
        beforeReview: (ctx) => {
          order.push(1);
          return { ...ctx, files: [...ctx.files, 'file1.ts'] };
        },
      },
      {
        name: 'plugin-2',
        beforeReview: (ctx) => {
          order.push(2);
          return { ...ctx, files: [...ctx.files, 'file2.ts'] };
        },
      },
    ];

    const initialCtx: ReviewContext = {
      diff: 'test diff',
      files: [],
      projectDir: '/test',
    };

    const result = await runBeforeReviewHooks(plugins, initialCtx);

    expect(order).toEqual([1, 2]);
    expect(result.files).toEqual(['file1.ts', 'file2.ts']);
  });

  it('handles async hooks', async () => {
    const plugins: StargazerPlugin[] = [
      {
        name: 'async-plugin',
        beforeReview: async (ctx) => {
          await new Promise((r) => setTimeout(r, 10));
          return { ...ctx, diff: ctx.diff + ' modified' };
        },
      },
    ];

    const initialCtx: ReviewContext = {
      diff: 'original',
      files: [],
      projectDir: '/test',
    };

    const result = await runBeforeReviewHooks(plugins, initialCtx);
    expect(result.diff).toBe('original modified');
  });

  it('skips plugins without the hook', async () => {
    const plugins: StargazerPlugin[] = [
      { name: 'no-hook' },
      {
        name: 'has-hook',
        beforeReview: (ctx) => ({ ...ctx, diff: 'modified' }),
      },
    ];

    const initialCtx: ReviewContext = {
      diff: 'original',
      files: [],
      projectDir: '/test',
    };

    const result = await runBeforeReviewHooks(plugins, initialCtx);
    expect(result.diff).toBe('modified');
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

    const result = runFilterHooks(plugins, issues);

    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('src/app.ts');
    expect(result[0].severity).toBe('high');
  });
});
