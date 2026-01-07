---
id: task-126
title: Add providerSelect to Screen type
status: completed
priority: high
labels:
  - cli
  - tui
  - state
  - providers
created: '2026-01-07'
order: 126
assignee: glm
---

## Description

Update the Screen type in app-context.tsx to include the providerSelect screen for the provider selection flow.

## Acceptance Criteria

- [x] Add `providerSelect` to the Screen type union
- [x] Add `apiKeySetup` to the Screen type union
- [x] Update screens index to export ProviderSelectScreen

## Implementation

**File**: `packages/cli/src/tui/state/app-context.tsx`

Update the Screen type:

```typescript
export type Screen = 'home' | 'chat' | 'history' | 'settings' | 'help' | 'review' | 'loading' | 'error' | 'providerSelect' | 'apiKeySetup';
```

**File**: `packages/cli/src/tui/screens/index.ts`

Add export:

```typescript
export { ProviderSelectScreen } from './provider-select-screen.js';
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
