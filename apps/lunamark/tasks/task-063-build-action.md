---
id: task-063
title: Build action
status: todo
assignee: voitb
priority: medium
labels:
  - action
  - build
created: '2026-01-01'
order: 630
---
## Description

Configure and build the GitHub Action.

## Acceptance Criteria

- [ ] Create `packages/action/tsup.config.ts`
- [ ] Configure for Node.js 20
- [ ] Bundle all dependencies (for Action portability)
- [ ] Build creates dist/index.js

## Implementation

**File**: `packages/action/tsup.config.ts`

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'], // GitHub Actions require CommonJS
  target: 'node20',
  outDir: 'dist',
  clean: true,
  minify: true,
  // Bundle everything for GitHub Action (no node_modules)
  noExternal: [/.*/],
  // Include source maps for debugging
  sourcemap: true,
});
```

**File**: `packages/action/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

## Test

```bash
cd packages/action && pnpm build
ls -la dist/
```

Should create:
- `dist/index.js` (bundled action)
- `dist/index.js.map` (source map)

**Full test:**
```bash
# Verify the built action has no external requires
node -e "require('./packages/action/dist/index.js')" 2>&1 | head -5
```

Note: Will show usage errors since we're not in GitHub Actions context, but should not show missing module errors.
