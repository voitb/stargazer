---
id: task-116
title: Create hooks barrel export
status: completed
priority: low
labels:
  - cli
  - tui
  - hooks
created: '2025-01-06'
order: 116
assignee: glm
---

## Description

Create the barrel export file for all TUI hooks.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/hooks/index.ts`
- [ ] Export useReview hook

## Implementation

**File**: `packages/cli/src/tui/hooks/index.ts`

```typescript
export { useReview } from './use-review.js';
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
