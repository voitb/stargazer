---
id: task-053
title: Create resolveConfig function
status: todo
priority: medium
labels:
  - core
  - config
created: '2026-01-01'
order: 530
---
## Description

Create function to merge user config with defaults.

## Acceptance Criteria

- [ ] Create `packages/core/src/config/resolve.ts`
- [ ] Implement `resolveConfig()` function
- [ ] Merge user config with DEFAULT_CONFIG
- [ ] Return ResolvedConfig with all fields

## Implementation

**File**: `packages/core/src/config/resolve.ts`

```typescript
import type { StargazerConfig, ResolvedConfig } from './types';
import { DEFAULT_CONFIG } from './defaults';

/**
 * Resolves user configuration by merging with defaults.
 * Any unspecified values will use the default.
 *
 * @param config - Optional user configuration
 * @returns Fully resolved configuration with all fields populated
 */
export function resolveConfig(config?: StargazerConfig): ResolvedConfig {
  if (!config) {
    return DEFAULT_CONFIG;
  }

  return {
    model: config.model ?? DEFAULT_CONFIG.model,
    minSeverity: config.minSeverity ?? DEFAULT_CONFIG.minSeverity,
    maxIssues: config.maxIssues ?? DEFAULT_CONFIG.maxIssues,
    ignore: config.ignore ?? DEFAULT_CONFIG.ignore,
    plugins: config.plugins ?? DEFAULT_CONFIG.plugins,
  };
}

/**
 * Merges two ignore lists, removing duplicates.
 */
export function mergeIgnorePatterns(
  base: readonly string[],
  additional: readonly string[]
): readonly string[] {
  return [...new Set([...base, ...additional])];
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
