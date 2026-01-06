---
id: task-048
title: Create ignorePathsPlugin
status: todo
assignee: voitb
priority: medium
labels:
  - core
  - plugins
created: '2026-01-01'
order: 480
---
## Description

Create a built-in plugin that filters out issues from specified paths.

## Acceptance Criteria

- [ ] Create `packages/core/src/plugins/ignore-paths.ts`
- [ ] Implement `ignorePathsPlugin` factory
- [ ] Accept paths array in options
- [ ] Filter issues where file matches any path

## Implementation

**File**: `packages/core/src/plugins/ignore-paths.ts`

```typescript
import type { PluginFactory } from './types';

export type IgnorePathsOptions = {
  /** Paths or path patterns to ignore (uses includes match) */
  paths: readonly string[];
};

/**
 * Plugin that filters out issues from specified paths.
 * Useful for ignoring generated code, legacy files, or test files.
 *
 * @example
 * ignorePathsPlugin({ paths: ['/generated/', '/legacy/', '.test.ts'] })
 */
export const ignorePathsPlugin: PluginFactory<IgnorePathsOptions> = (options) => ({
  name: 'ignore-paths',

  filterIssues: (issues) => {
    if (!options?.paths.length) return issues;

    return issues.filter((issue) => {
      // Check if file path contains any of the ignored patterns
      const shouldIgnore = options.paths.some((pattern) =>
        issue.file.includes(pattern)
      );
      return !shouldIgnore;
    });
  },
});
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
