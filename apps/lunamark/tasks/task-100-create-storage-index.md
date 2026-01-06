---
id: task-100
title: Create storage module index
status: pending
priority: medium
labels:
  - cli
  - tui
  - storage
created: '2025-01-06'
order: 100
assignee: glm
---

## Description

Create the barrel export file for the storage module.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/storage/index.ts`
- [ ] Export all from paths, schemas, types, and session-store

## Implementation

**File**: `packages/cli/src/tui/storage/index.ts`

```typescript
export * from './paths.js';
export * from './schemas.js';
export * from './types.js';
export * from './session-store.js';
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
