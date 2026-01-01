---
id: task-052
title: Create defineConfig helper
status: todo
priority: medium
labels:
  - core
  - config
created: '2026-01-01'
order: 520
---
## Description

Create the defineConfig helper for type-safe configuration files.

## Acceptance Criteria

- [ ] Create `packages/core/src/config/define.ts`
- [ ] Implement `defineConfig()` function
- [ ] Provides TypeScript autocomplete in config files

## Implementation

**File**: `packages/core/src/config/define.ts`

```typescript
import type { StargazerConfig } from './types';

/**
 * Helper function for defining Stargazer configuration with TypeScript support.
 * Use this in your stargazer.config.ts file for autocomplete and type checking.
 *
 * @example
 * // stargazer.config.ts
 * import { defineConfig } from '@stargazer/core';
 *
 * export default defineConfig({
 *   model: 'gemini-2.0-pro',
 *   minSeverity: 'medium',
 *   ignore: ['**/legacy/**'],
 * });
 */
export function defineConfig(config: StargazerConfig): StargazerConfig {
  return config;
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
