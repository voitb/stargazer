---
id: task-114
title: Create screens barrel export
status: completed
priority: low
labels:
  - cli
  - tui
  - screens
created: '2025-01-06'
order: 114
assignee: glm
---

## Description

Create the barrel export file for all TUI screens.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/screens/index.ts`
- [ ] Export all screens

## Implementation

**File**: `packages/cli/src/tui/screens/index.ts`

```typescript
export { HomeScreen } from './HomeScreen.js';
export { ChatScreen } from './ChatScreen.js';
export { HistoryScreen } from './HistoryScreen.js';
export { HelpScreen } from './HelpScreen.js';
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
