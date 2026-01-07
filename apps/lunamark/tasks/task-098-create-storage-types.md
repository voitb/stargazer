---
id: task-098
title: Create storage types re-exports
status: completed
priority: medium
labels:
  - cli
  - tui
  - storage
created: '2025-01-06'
order: 98
assignee: glm
---

## Description

Create a types module that re-exports all types and schemas from the schemas file for cleaner imports.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/storage/types.ts`
- [ ] Re-export all types from schemas.ts
- [ ] Re-export all schemas for validation

## Implementation

**File**: `packages/cli/src/tui/storage/types.ts`

```typescript
export type {
  ChatMessageRole,
  ReviewDecision,
  ChatMessage,
  SessionMetadata,
  SessionIndexEntry,
  SessionIndex,
  SessionData,
} from './schemas.js';

export {
  ChatMessageSchema,
  SessionMetadataSchema,
  SessionIndexEntrySchema,
  SessionIndexSchema,
  SessionDataSchema,
  MessagesArraySchema,
} from './schemas.js';
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
