---
id: task-046
title: Create runHooks function
status: todo
assignee: voitb
priority: high
labels:
  - core
  - plugins
created: '2026-01-01'
order: 460
---
## Description

Create the hook runner that executes plugin hooks in sequence.

## Acceptance Criteria

- [ ] Create `packages/core/src/plugins/hooks.ts`
- [ ] Implement `runHooks()` function
- [ ] Plugins run in sequence, passing result to next
- [ ] Handle both sync and async hooks

## Implementation

**File**: `packages/core/src/plugins/hooks.ts`

```typescript
import type { StargazerPlugin } from './types';

/**
 * Runs a specific hook across all plugins in sequence.
 * Each plugin receives the result from the previous plugin.
 *
 * @param plugins - Array of plugins to run
 * @param hookName - Name of the hook to execute
 * @param initialValue - Starting value passed to first plugin
 * @param args - Additional arguments passed to each hook
 * @returns Final value after all plugins have processed it
 */
export async function runHooks<T>(
  plugins: readonly StargazerPlugin[],
  hookName: keyof StargazerPlugin,
  initialValue: T,
  ...args: unknown[]
): Promise<T> {
  let result = initialValue;

  for (const plugin of plugins) {
    const hook = plugin[hookName];
    if (typeof hook === 'function') {
      // Call hook with current result and additional args
      result = await (hook as Function)(result, ...args);
    }
  }

  return result;
}

/**
 * Runs filterIssues hooks synchronously (they don't need to be async).
 */
export function runFilterHooks<T>(
  plugins: readonly StargazerPlugin[],
  initialValue: T
): T {
  let result = initialValue;

  for (const plugin of plugins) {
    if (plugin.filterIssues) {
      result = plugin.filterIssues(result as any) as T;
    }
  }

  return result;
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
