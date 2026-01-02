---
id: task-047
title: Test runHooks function
status: todo
priority: medium
labels:
  - core
  - plugins
  - testing
created: '2026-01-01'
order: 470
---
## Description

Create unit tests for the runHooks function.

## Acceptance Criteria

- [ ] Create `packages/core/src/plugins/hooks.test.ts`
- [ ] Test plugins run in sequence
- [ ] Test result is passed through pipeline
- [ ] Test handles async hooks

## Implementation

**File**: `packages/core/src/plugins/hooks.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { runHooks, runFilterHooks } from './hooks';
import type { StargazerPlugin, ReviewContext } from './types';

describe('runHooks', () => {
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

    const result = await runHooks(plugins, 'beforeReview', initialCtx);

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

    const result = await runHooks(plugins, 'beforeReview', initialCtx);
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

    const result = await runHooks(plugins, 'beforeReview', initialCtx);
    expect(result.diff).toBe('modified');
  });
});

describe('runFilterHooks', () => {
  it('filters issues through plugins', () => {
    const plugins: StargazerPlugin[] = [
      {
        name: 'filter-low',
        filterIssues: (issues) => issues.filter((i: any) => i.severity !== 'low'),
      },
      {
        name: 'filter-test-files',
        filterIssues: (issues) =>
          issues.filter((i: any) => !i.file.includes('.test.')),
      },
    ];

    const issues = [
      { file: 'src/app.ts', severity: 'high' },
      { file: 'src/app.ts', severity: 'low' },
      { file: 'src/app.test.ts', severity: 'high' },
    ];

    const result = runFilterHooks(plugins, issues);

    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('src/app.ts');
    expect(result[0].severity).toBe('high');
  });
});
```

## Test

```bash
cd packages/core && pnpm test hooks.test.ts
```
