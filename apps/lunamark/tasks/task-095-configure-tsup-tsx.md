---
id: task-095
title: Configure tsup for TSX files
status: completed
priority: high
labels:
  - cli
  - tui
  - setup
created: '2025-01-06'
order: 95
assignee: glm
---

## Description

Update the tsup build configuration to handle TSX files with JSX transform.

## Acceptance Criteria

- [ ] Entry point changed to `src/index.tsx`
- [ ] JSX transform enabled via esbuild options
- [ ] Build produces working output

## Implementation

**File**: `packages/cli/tsup.config.ts`

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm build
# Should complete without errors
```
