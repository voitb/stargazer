---
id: task-119
title: Create state barrel export
status: pending
priority: low
labels:
  - cli
  - tui
  - state
created: '2025-01-06'
order: 119
assignee: glm
---

## Description

Create the barrel export file for the state module.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/state/index.ts`
- [ ] Export AppProvider and useApp

## Implementation

**File**: `packages/cli/src/tui/state/index.ts`

```typescript
export { AppProvider, useApp, type Screen } from './app-context.js';
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
