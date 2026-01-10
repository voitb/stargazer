---
id: task-154
title: Implement conversation history persistence
status: done
priority: critical
labels:
  - cli
  - feature
  - storage
created: '2025-01-10'
order: 154
assignee: ai-agent
depends_on: []
---

## Description

Currently, conversation history is NOT saved and users cannot return to previous sessions. This is a critical missing feature that needs to be implemented immediately.

## Requirements

1. Save all conversations to disk automatically
2. List previous conversations in history screen
3. Resume any previous conversation
4. Search through conversation history
5. Delete conversations
6. Export conversations to Markdown

## Architecture

### Storage Location

```
~/.stargazer/
├── config.json          # User configuration
├── sessions/
│   ├── index.json       # Session metadata index
│   └── {session-id}/
│       ├── metadata.json
│       └── messages.json
└── cache/
    └── repo-summaries/
```

### Data Models

**File:** `packages/cli/src/tui/storage/schemas.ts` (create or update)

```typescript
import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string().datetime(),
  tokenCount: z.number().optional(),
});

export const SessionMetadataSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  projectPath: z.string(),
  model: z.string(),
  totalTokens: z.number(),
  messageCount: z.number(),
  preview: z.string(), // First user message truncated
});

export const SessionIndexSchema = z.object({
  version: z.number(),
  sessions: z.array(SessionMetadataSchema),
});

export type Message = z.infer<typeof MessageSchema>;
export type SessionMetadata = z.infer<typeof SessionMetadataSchema>;
export type SessionIndex = z.infer<typeof SessionIndexSchema>;
```

## Implementation

### Step 1: Create session storage module

**File:** `packages/cli/src/tui/storage/session-store.ts`

```typescript
import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import {
  type Message,
  type SessionMetadata,
  type SessionIndex,
  SessionIndexSchema,
  MessageSchema,
} from './schemas.js';

const STARGAZER_DIR = join(homedir(), '.stargazer');
const SESSIONS_DIR = join(STARGAZER_DIR, 'sessions');
const INDEX_FILE = join(SESSIONS_DIR, 'index.json');

/**
 * Ensure storage directories exist
 */
export async function initializeStorage(): Promise<void> {
  await mkdir(SESSIONS_DIR, { recursive: true });

  if (!existsSync(INDEX_FILE)) {
    const initialIndex: SessionIndex = { version: 1, sessions: [] };
    await writeFile(INDEX_FILE, JSON.stringify(initialIndex, null, 2));
  }
}

/**
 * Get all sessions metadata
 */
export async function getAllSessions(): Promise<SessionMetadata[]> {
  await initializeStorage();

  const content = await readFile(INDEX_FILE, 'utf-8');
  const index = SessionIndexSchema.parse(JSON.parse(content));

  return index.sessions.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Create a new session
 */
export async function createSession(
  projectPath: string,
  model: string,
  firstMessage?: string
): Promise<string> {
  await initializeStorage();

  const sessionId = randomUUID();
  const sessionDir = join(SESSIONS_DIR, sessionId);
  await mkdir(sessionDir, { recursive: true });

  const now = new Date().toISOString();
  const metadata: SessionMetadata = {
    id: sessionId,
    title: firstMessage?.slice(0, 50) || 'New Session',
    createdAt: now,
    updatedAt: now,
    projectPath,
    model,
    totalTokens: 0,
    messageCount: 0,
    preview: firstMessage?.slice(0, 100) || '',
  };

  // Save metadata
  await writeFile(
    join(sessionDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  // Initialize empty messages
  await writeFile(join(sessionDir, 'messages.json'), '[]');

  // Update index
  const index = await getIndex();
  index.sessions.push(metadata);
  await saveIndex(index);

  return sessionId;
}

/**
 * Add message to session
 */
export async function addMessage(
  sessionId: string,
  message: Omit<Message, 'id' | 'timestamp'>
): Promise<Message> {
  const sessionDir = join(SESSIONS_DIR, sessionId);
  const messagesFile = join(sessionDir, 'messages.json');

  const newMessage: Message = {
    ...message,
    id: randomUUID(),
    timestamp: new Date().toISOString(),
  };

  // Read existing messages
  const content = await readFile(messagesFile, 'utf-8');
  const messages: Message[] = JSON.parse(content);
  messages.push(newMessage);

  // Save messages
  await writeFile(messagesFile, JSON.stringify(messages, null, 2));

  // Update metadata
  await updateSessionMetadata(sessionId, {
    messageCount: messages.length,
    updatedAt: newMessage.timestamp,
    totalTokens: messages.reduce((sum, m) => sum + (m.tokenCount || 0), 0),
  });

  return newMessage;
}

/**
 * Get all messages for a session
 */
export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const sessionDir = join(SESSIONS_DIR, sessionId);
  const messagesFile = join(sessionDir, 'messages.json');

  const content = await readFile(messagesFile, 'utf-8');
  return JSON.parse(content);
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const sessionDir = join(SESSIONS_DIR, sessionId);
  await rm(sessionDir, { recursive: true, force: true });

  const index = await getIndex();
  index.sessions = index.sessions.filter(s => s.id !== sessionId);
  await saveIndex(index);
}

/**
 * Search sessions by content
 */
export async function searchSessions(query: string): Promise<SessionMetadata[]> {
  const sessions = await getAllSessions();
  const lowerQuery = query.toLowerCase();

  const results: SessionMetadata[] = [];

  for (const session of sessions) {
    // Check title and preview
    if (
      session.title.toLowerCase().includes(lowerQuery) ||
      session.preview.toLowerCase().includes(lowerQuery)
    ) {
      results.push(session);
      continue;
    }

    // Check message content
    try {
      const messages = await getSessionMessages(session.id);
      if (messages.some(m => m.content.toLowerCase().includes(lowerQuery))) {
        results.push(session);
      }
    } catch {
      // Session might be corrupted, skip
    }
  }

  return results;
}

/**
 * Export session to Markdown
 */
export async function exportSessionToMarkdown(sessionId: string): Promise<string> {
  const sessions = await getAllSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) throw new Error('Session not found');

  const messages = await getSessionMessages(sessionId);

  let markdown = `# ${session.title}\n\n`;
  markdown += `**Created:** ${new Date(session.createdAt).toLocaleString()}\n`;
  markdown += `**Model:** ${session.model}\n`;
  markdown += `**Project:** ${session.projectPath}\n\n`;
  markdown += `---\n\n`;

  for (const message of messages) {
    const roleLabel = message.role === 'user' ? '**You:**' : '**Assistant:**';
    markdown += `${roleLabel}\n\n${message.content}\n\n---\n\n`;
  }

  return markdown;
}

// Helper functions
async function getIndex(): Promise<SessionIndex> {
  const content = await readFile(INDEX_FILE, 'utf-8');
  return SessionIndexSchema.parse(JSON.parse(content));
}

async function saveIndex(index: SessionIndex): Promise<void> {
  await writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
}

async function updateSessionMetadata(
  sessionId: string,
  updates: Partial<SessionMetadata>
): Promise<void> {
  const index = await getIndex();
  const sessionIndex = index.sessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return;

  index.sessions[sessionIndex] = { ...index.sessions[sessionIndex], ...updates };
  await saveIndex(index);

  // Also update the individual metadata file
  const sessionDir = join(SESSIONS_DIR, sessionId);
  await writeFile(
    join(sessionDir, 'metadata.json'),
    JSON.stringify(index.sessions[sessionIndex], null, 2)
  );
}
```

### Step 2: Update session context to use persistence

**File:** `packages/cli/src/tui/features/sessions/session.context.tsx`

Update the context to save/load from disk:

```typescript
import {
  createSession,
  addMessage,
  getSessionMessages,
  getAllSessions,
  deleteSession,
} from '../../storage/session-store.js';

// In the provider, load sessions from disk on mount
useEffect(() => {
  getAllSessions().then(setSessions).catch(console.error);
}, []);

// When creating a new session, persist to disk
const createNewSession = async (firstMessage?: string) => {
  const sessionId = await createSession(projectPath, currentModel, firstMessage);
  const sessions = await getAllSessions();
  setSessions(sessions);
  setActiveSessionId(sessionId);
  return sessionId;
};

// When adding a message, persist to disk
const addMessageToSession = async (sessionId: string, message: NewMessage) => {
  await addMessage(sessionId, message);
  // ... rest of existing logic
};
```

### Step 3: Update history screen to show real sessions

**File:** `packages/cli/src/tui/features/sessions/history-screen.tsx`

```typescript
import { Box, Text, useInput } from 'ink';
import { useState, useEffect } from 'react';
import { getAllSessions, deleteSession, type SessionMetadata } from '../../storage/session-store.js';
import { useNavigation } from '../../state/navigation-context.js';
import { ScreenTitle, HintText, Badge } from '../../design-system/index.js';

export function HistoryScreen() {
  const { navigate } = useNavigation();
  const [sessions, setSessions] = useState<SessionMetadata[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  useInput((input, key) => {
    if (key.escape || input === 'b') {
      navigate('home');
      return;
    }

    if (key.upArrow || input === 'k') {
      setSelectedIndex(i => Math.max(0, i - 1));
    }
    if (key.downArrow || input === 'j') {
      setSelectedIndex(i => Math.min(sessions.length - 1, i + 1));
    }
    if (key.return) {
      const session = sessions[selectedIndex];
      if (session) {
        // Resume this session
        navigate('chat', { sessionId: session.id });
      }
    }
    if (input === 'd') {
      const session = sessions[selectedIndex];
      if (session) {
        deleteSession(session.id).then(() => {
          setSessions(s => s.filter(x => x.id !== session.id));
        });
      }
    }
  });

  if (loading) {
    return <Text>Loading sessions...</Text>;
  }

  if (sessions.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <ScreenTitle>Session History</ScreenTitle>
        <Text dimColor>No previous sessions found.</Text>
        <HintText>Start a new conversation to create a session.</HintText>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <ScreenTitle>Session History</ScreenTitle>
      <Box flexDirection="column" marginTop={1}>
        {sessions.map((session, index) => (
          <Box key={session.id} flexDirection="row" gap={2}>
            <Text color={index === selectedIndex ? 'cyan' : undefined}>
              {index === selectedIndex ? '▶' : ' '}
            </Text>
            <Text bold={index === selectedIndex}>{session.title}</Text>
            <Text dimColor>{new Date(session.updatedAt).toLocaleDateString()}</Text>
            <Badge variant="brand">{session.messageCount} msgs</Badge>
          </Box>
        ))}
      </Box>
      <Box marginTop={2}>
        <HintText>↑/↓ navigate • Enter resume • D delete • ESC back</HintText>
      </Box>
    </Box>
  );
}
```

## Acceptance Criteria

- [ ] Sessions are automatically saved to `~/.stargazer/sessions/`
- [ ] Session index tracks all sessions with metadata
- [ ] Users can view list of previous sessions
- [ ] Users can resume any previous session
- [ ] Users can delete sessions
- [ ] Sessions include: messages, timestamps, model, project path, token count
- [ ] TypeScript types and Zod schemas for all data

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit

# Manual test:
# 1. Start CLI, have a conversation
# 2. Exit CLI
# 3. Start CLI again
# 4. Navigate to history
# 5. Verify session appears
# 6. Resume session and verify messages load
```

## Files Changed

- CREATE: `packages/cli/src/tui/storage/session-store.ts`
- UPDATE: `packages/cli/src/tui/storage/schemas.ts`
- UPDATE: `packages/cli/src/tui/storage/index.ts`
- UPDATE: `packages/cli/src/tui/features/sessions/session.context.tsx`
- UPDATE: `packages/cli/src/tui/features/sessions/history-screen.tsx`
