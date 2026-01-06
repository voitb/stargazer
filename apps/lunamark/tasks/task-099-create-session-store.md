---
id: task-099
title: Create session store with CRUD operations
status: pending
priority: high
labels:
  - cli
  - tui
  - storage
created: '2025-01-06'
order: 99
assignee: glm
---

## Description

Create the session store module that handles all session CRUD operations with Zod validation on load.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/storage/session-store.ts`
- [ ] Implement `loadSessionIndex()` with Zod validation
- [ ] Implement `saveSessionIndex()`
- [ ] Implement `createSession()` that creates new session
- [ ] Implement `loadSession()` with Zod validation
- [ ] Implement `addMessageToSession()`
- [ ] Implement `deleteSession()`
- [ ] Implement `listSessionsForProject()`
- [ ] Implement `listAllSessions()`
- [ ] All functions return `Result<T>` type

## Implementation

**File**: `packages/cli/src/tui/storage/session-store.ts`

```typescript
import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { ok, err, type Result } from '@stargazer/core';
import {
  getSessionDir,
  getSessionIndexPath,
  ensureDir,
  ensureStorageStructure,
} from './paths.js';
import {
  SessionIndexSchema,
  SessionMetadataSchema,
  MessagesArraySchema,
  type SessionIndex,
  type SessionIndexEntry,
  type SessionMetadata,
  type SessionData,
  type ChatMessage,
} from './types.js';

/**
 * Load the sessions index with Zod validation
 */
export async function loadSessionIndex(): Promise<Result<SessionIndex>> {
  try {
    await ensureStorageStructure();
    const indexPath = getSessionIndexPath();

    try {
      const content = await readFile(indexPath, 'utf-8');
      const rawData = JSON.parse(content);

      // Validate with Zod schema
      const parseResult = SessionIndexSchema.safeParse(rawData);
      if (!parseResult.success) {
        return err({
          code: 'SCHEMA_VALIDATION',
          message: `Invalid session index format: ${parseResult.error.message}`,
        });
      }

      return ok(parseResult.data);
    } catch {
      // File doesn't exist, return empty index
      return ok({ sessions: [] });
    }
  } catch (error) {
    return err({
      code: 'FILE_NOT_FOUND',
      message: `Failed to load session index: ${error}`,
    });
  }
}

/**
 * Save the sessions index
 */
export async function saveSessionIndex(index: SessionIndex): Promise<Result<void>> {
  try {
    await ensureStorageStructure();
    const indexPath = getSessionIndexPath();
    await writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
    return ok(undefined);
  } catch (error) {
    return err({
      code: 'API_ERROR',
      message: `Failed to save session index: ${error}`,
    });
  }
}

/**
 * Create a new session
 */
export async function createSession(projectPath: string): Promise<Result<SessionData>> {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    const projectName = basename(projectPath);

    const metadata: SessionMetadata = {
      id,
      projectPath,
      projectName,
      createdAt: now,
      updatedAt: now,
    };

    const sessionData: SessionData = {
      metadata,
      messages: [],
    };

    // Create session directory and save metadata
    const sessionDir = getSessionDir(id);
    await ensureDir(sessionDir);
    await writeFile(
      `${sessionDir}/metadata.json`,
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );
    await writeFile(
      `${sessionDir}/messages.json`,
      JSON.stringify([], null, 2),
      'utf-8'
    );

    // Update index
    const indexResult = await loadSessionIndex();
    if (!indexResult.ok) {
      return indexResult;
    }

    const indexEntry: SessionIndexEntry = {
      id,
      projectPath,
      projectName,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    };

    const newIndex: SessionIndex = {
      sessions: [indexEntry, ...indexResult.data.sessions],
    };

    const saveResult = await saveSessionIndex(newIndex);
    if (!saveResult.ok) {
      return saveResult;
    }

    return ok(sessionData);
  } catch (error) {
    return err({
      code: 'API_ERROR',
      message: `Failed to create session: ${error}`,
    });
  }
}

/**
 * Load a session by ID with Zod validation
 */
export async function loadSession(sessionId: string): Promise<Result<SessionData>> {
  try {
    const sessionDir = getSessionDir(sessionId);

    const metadataContent = await readFile(`${sessionDir}/metadata.json`, 'utf-8');
    const rawMetadata = JSON.parse(metadataContent);

    // Validate metadata with Zod
    const metadataResult = SessionMetadataSchema.safeParse(rawMetadata);
    if (!metadataResult.success) {
      return err({
        code: 'SCHEMA_VALIDATION',
        message: `Invalid session metadata: ${metadataResult.error.message}`,
      });
    }

    const messagesContent = await readFile(`${sessionDir}/messages.json`, 'utf-8');
    const rawMessages = JSON.parse(messagesContent);

    // Validate messages with Zod
    const messagesResult = MessagesArraySchema.safeParse(rawMessages);
    if (!messagesResult.success) {
      return err({
        code: 'SCHEMA_VALIDATION',
        message: `Invalid session messages: ${messagesResult.error.message}`,
      });
    }

    return ok({
      metadata: metadataResult.data,
      messages: messagesResult.data,
    });
  } catch (error) {
    return err({
      code: 'FILE_NOT_FOUND',
      message: `Failed to load session ${sessionId}: ${error}`,
    });
  }
}

/**
 * Add a message to a session
 */
export async function addMessageToSession(
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<Result<ChatMessage>> {
  try {
    const sessionDir = getSessionDir(sessionId);

    // Load existing messages
    const messagesContent = await readFile(`${sessionDir}/messages.json`, 'utf-8');
    const messages = JSON.parse(messagesContent) as ChatMessage[];

    // Create new message
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };

    // Save updated messages
    const updatedMessages = [...messages, newMessage];
    await writeFile(
      `${sessionDir}/messages.json`,
      JSON.stringify(updatedMessages, null, 2),
      'utf-8'
    );

    // Update session index
    const indexResult = await loadSessionIndex();
    if (indexResult.ok) {
      const updatedSessions = indexResult.data.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, updatedAt: newMessage.timestamp, messageCount: updatedMessages.length }
          : s
      );
      await saveSessionIndex({ sessions: updatedSessions });
    }

    return ok(newMessage);
  } catch (error) {
    return err({
      code: 'API_ERROR',
      message: `Failed to add message: ${error}`,
    });
  }
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<Result<void>> {
  try {
    const { rm } = await import('node:fs/promises');
    const sessionDir = getSessionDir(sessionId);

    // Remove session directory
    await rm(sessionDir, { recursive: true, force: true });

    // Update index
    const indexResult = await loadSessionIndex();
    if (indexResult.ok) {
      const updatedSessions = indexResult.data.sessions.filter((s) => s.id !== sessionId);
      await saveSessionIndex({ sessions: updatedSessions });
    }

    return ok(undefined);
  } catch (error) {
    return err({
      code: 'API_ERROR',
      message: `Failed to delete session: ${error}`,
    });
  }
}

/**
 * List all sessions for a project
 */
export async function listSessionsForProject(
  projectPath: string
): Promise<Result<readonly SessionIndexEntry[]>> {
  const indexResult = await loadSessionIndex();
  if (!indexResult.ok) {
    return indexResult;
  }

  const filtered = indexResult.data.sessions.filter(
    (s) => s.projectPath === projectPath
  );
  return ok(filtered);
}

/**
 * List all sessions
 */
export async function listAllSessions(): Promise<Result<readonly SessionIndexEntry[]>> {
  const indexResult = await loadSessionIndex();
  if (!indexResult.ok) {
    return indexResult;
  }
  return ok(indexResult.data.sessions);
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
