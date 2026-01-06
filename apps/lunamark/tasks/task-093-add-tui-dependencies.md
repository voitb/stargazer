---
id: task-093
title: Add TUI dependencies to CLI package
status: completed
priority: high
labels:
  - cli
  - tui
  - setup
created: '2025-01-06'
order: 93
assignee: glm
---

## Description

Add the required dependencies for building an interactive TUI (Terminal User Interface) using Ink (React for terminal) to the CLI package.

## Acceptance Criteria

- [ ] Add `ink` ^5.2.0 to dependencies
- [ ] Add `@inkjs/ui` ^2.0.0 to dependencies
- [ ] Add `react` ^18.2.0 to dependencies
- [ ] Add `uuid` ^9.0.0 to dependencies
- [ ] Add `date-fns` ^3.0.0 to dependencies
- [ ] Add `@types/react` ^18.2.0 to devDependencies
- [ ] Run `pnpm install` successfully

## Implementation

**File**: `packages/cli/package.json`

Add these to the existing dependencies section:

```json
{
  "dependencies": {
    "ink": "^5.2.0",
    "@inkjs/ui": "^2.0.0",
    "react": "^18.2.0",
    "uuid": "^9.0.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0"
  }
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon
pnpm install
# Should complete without errors
```
