---
id: task-051
title: Create DEFAULT_CONFIG
status: done
assignee: voitb
priority: medium
labels:
  - core
  - config
created: '2026-01-01'
order: 510
---
## Description

Create default configuration values.

## Acceptance Criteria

- [ ] Create `packages/core/src/config/defaults.ts`
- [ ] Define DEFAULT_CONFIG constant
- [ ] Use sensible defaults for hackathon demo

## Implementation

**File**: `packages/core/src/config/defaults.ts`

```typescript
import type { ResolvedConfig } from './types';

/**
 * Default configuration values.
 * These are used when user doesn't specify a value.
 */
export const DEFAULT_CONFIG: ResolvedConfig = {
  // Use fast model for quick reviews
  model: 'gemini-2.0-flash',

  // Report all severity levels by default
  minSeverity: 'low',

  // Reasonable limit to avoid overwhelming output
  maxIssues: 20,

  // Common paths to ignore
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.git/**',
    '**/coverage/**',
    '**/*.min.js',
  ],

  // No plugins by default
  plugins: [],
};
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
