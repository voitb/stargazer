---
id: task-049
title: Test ignorePathsPlugin
status: todo
priority: medium
labels:
  - core
  - plugins
  - testing
created: '2026-01-01'
order: 490
---
## Description

Create unit tests for the ignorePathsPlugin.

## Acceptance Criteria

- [ ] Create `packages/core/src/plugins/ignore-paths.test.ts`
- [ ] Test filtering by path patterns
- [ ] Test with empty paths array
- [ ] Test multiple path patterns

## Implementation

**File**: `packages/core/src/plugins/ignore-paths.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { ignorePathsPlugin } from './ignore-paths';
import type { Issue } from '../review/schemas';

describe('ignorePathsPlugin', () => {
  const createIssue = (file: string): Issue => ({
    file,
    line: 1,
    severity: 'medium',
    category: 'bug',
    message: 'Test issue',
    confidence: 0.9,
  });

  it('filters issues in ignored paths', () => {
    const plugin = ignorePathsPlugin({
      paths: ['/test/', '/generated/'],
    });

    const issues = [
      createIssue('src/main.ts'),
      createIssue('src/test/main.test.ts'),
      createIssue('src/generated/types.ts'),
      createIssue('src/utils/helper.ts'),
    ];

    const filtered = plugin.filterIssues!(issues);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((i) => i.file)).toEqual([
      'src/main.ts',
      'src/utils/helper.ts',
    ]);
  });

  it('handles empty paths array', () => {
    const plugin = ignorePathsPlugin({ paths: [] });

    const issues = [
      createIssue('src/main.ts'),
      createIssue('src/test/main.test.ts'),
    ];

    const filtered = plugin.filterIssues!(issues);

    expect(filtered).toHaveLength(2);
  });

  it('filters by file extension pattern', () => {
    const plugin = ignorePathsPlugin({
      paths: ['.test.ts', '.spec.ts'],
    });

    const issues = [
      createIssue('src/main.ts'),
      createIssue('src/main.test.ts'),
      createIssue('src/utils.spec.ts'),
    ];

    const filtered = plugin.filterIssues!(issues);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].file).toBe('src/main.ts');
  });

  it('returns all issues when no options provided', () => {
    const plugin = ignorePathsPlugin(undefined);

    const issues = [createIssue('src/main.ts')];
    const filtered = plugin.filterIssues!(issues);

    expect(filtered).toHaveLength(1);
  });
});
```

## Test

```bash
cd packages/core && pnpm test ignore-paths.test.ts
```
