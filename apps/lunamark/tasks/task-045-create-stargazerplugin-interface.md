---
id: task-045
title: Create StargazerPlugin interface
status: done
priority: high
labels:
  - core
  - plugins
created: '2026-01-01'
order: 10000
assignee: voitb
---
## Description

Create the plugin interface with Vite-style hooks.

## Acceptance Criteria

- [ ] Create `packages/core/src/plugins/types.ts`
- [ ] Define StargazerPlugin interface
- [ ] Define PluginFactory type
- [ ] Define ReviewContext type

## Implementation

**File**: `packages/core/src/plugins/types.ts`

```typescript
import type { ReviewResult, Issue } from '../review/schemas';

/**
 * Context passed to plugin hooks during review.
 */
export type ReviewContext = {
  readonly diff: string;
  readonly files: readonly string[];
  readonly projectDir: string;
};

/**
 * Vite-style plugin interface with optional hooks.
 * Plugins can modify behavior at various stages of the review process.
 */
export type StargazerPlugin = {
  /** Plugin name for identification and debugging */
  readonly name: string;

  /** Called before sending to Gemini - can modify context */
  readonly beforeReview?: (
    ctx: ReviewContext
  ) => ReviewContext | Promise<ReviewContext>;

  /** Called after receiving result - can modify or enhance it */
  readonly afterReview?: (
    result: ReviewResult,
    ctx: ReviewContext
  ) => ReviewResult | Promise<ReviewResult>;

  /** Filter issues - useful for ignoring certain paths or categories */
  readonly filterIssues?: (issues: Issue[]) => Issue[];
};

/**
 * Factory function to create a plugin with options.
 * This pattern allows for configurable plugins.
 */
export type PluginFactory<T = void> = (options?: T) => StargazerPlugin;
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
