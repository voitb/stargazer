---
id: task-109
title: Create components barrel export
status: completed
priority: low
labels:
  - cli
  - tui
  - components
created: '2025-01-06'
order: 109
assignee: glm
---

## Description

Create the barrel export file for all TUI components.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/components/index.ts`
- [ ] Export all components

## Implementation

**File**: `packages/cli/src/tui/components/index.ts`

```typescript
export { Header } from './Header.js';
export { MainMenu } from './MainMenu.js';
export { StatusBar } from './StatusBar.js';
export { ChatMessage } from './ChatMessage.js';
export { ChatView } from './ChatView.js';
export { ChatInput } from './ChatInput.js';
export { SessionList } from './SessionList.js';
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
