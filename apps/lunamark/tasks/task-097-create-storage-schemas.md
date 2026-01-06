---
id: task-097
title: Create Zod schemas for storage types
status: pending
priority: high
labels:
  - cli
  - tui
  - storage
  - validation
created: '2025-01-06'
order: 97
assignee: glm
---

## Description

Create Zod validation schemas for all TUI storage types (sessions, messages, etc.) following the project's Zod-first pattern.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/storage/schemas.ts`
- [ ] Define `ChatMessageRoleSchema` enum
- [ ] Define `ReviewDecisionSchema` enum
- [ ] Define `ChatMessageSchema` with id, role, content, timestamp
- [ ] Define `SessionMetadataSchema` with id, projectPath, projectName, dates
- [ ] Define `SessionIndexEntrySchema` for index entries
- [ ] Define `SessionIndexSchema` for the full index
- [ ] Define `SessionDataSchema` combining metadata and messages
- [ ] Export inferred TypeScript types from schemas

## Implementation

**File**: `packages/cli/src/tui/storage/schemas.ts`

```typescript
import { z } from 'zod';

export const ChatMessageRoleSchema = z.enum(['user', 'assistant', 'system']);

export const ReviewDecisionSchema = z.enum(['approve', 'request_changes', 'comment']);

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  role: ChatMessageRoleSchema,
  content: z.string(),
  timestamp: z.string().datetime(),
  reviewId: z.string().uuid().optional(),
  command: z.string().optional(),
});

export const SessionMetadataSchema = z.object({
  id: z.string().uuid(),
  projectPath: z.string().min(1),
  projectName: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SessionIndexEntrySchema = z.object({
  id: z.string().uuid(),
  projectPath: z.string().min(1),
  projectName: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  messageCount: z.number().int().min(0),
  lastReviewDecision: ReviewDecisionSchema.optional(),
});

export const SessionIndexSchema = z.object({
  sessions: z.array(SessionIndexEntrySchema),
});

export const SessionDataSchema = z.object({
  metadata: SessionMetadataSchema,
  messages: z.array(ChatMessageSchema),
});

export const MessagesArraySchema = z.array(ChatMessageSchema);

// Export inferred types
export type ChatMessageRole = z.infer<typeof ChatMessageRoleSchema>;
export type ReviewDecision = z.infer<typeof ReviewDecisionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type SessionMetadata = z.infer<typeof SessionMetadataSchema>;
export type SessionIndexEntry = z.infer<typeof SessionIndexEntrySchema>;
export type SessionIndex = z.infer<typeof SessionIndexSchema>;
export type SessionData = z.infer<typeof SessionDataSchema>;
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
