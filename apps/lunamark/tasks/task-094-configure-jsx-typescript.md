---
id: task-094
title: Configure TypeScript for JSX support
status: completed
priority: high
labels:
  - cli
  - tui
  - setup
created: '2025-01-06'
order: 94
assignee: glm
---

## Description

Update the CLI package TypeScript configuration to support JSX for Ink/React components.

## Acceptance Criteria

- [ ] Add `jsx: "react-jsx"` to tsconfig.json compilerOptions
- [ ] TypeScript can compile `.tsx` files

## Implementation

**File**: `packages/cli/tsconfig.json`

Update the file to:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
# Should complete without JSX-related errors
```
