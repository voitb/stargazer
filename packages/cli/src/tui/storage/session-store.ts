import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { randomUUID } from 'node:crypto';
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

export async function loadSessionIndex(): Promise<Result<SessionIndex>> {
  try {
    await ensureStorageStructure();
    const indexPath = getSessionIndexPath();

    try {
      const content = await readFile(indexPath, 'utf-8');
      const rawData = JSON.parse(content);
      const parseResult = SessionIndexSchema.safeParse(rawData);

      if (!parseResult.success) {
        return err({
          code: 'SCHEMA_VALIDATION',
          message: `Invalid session index format: ${parseResult.error.message}`,
        });
      }
      return ok(parseResult.data);
    } catch (e) {
      if (e instanceof Error && 'code' in e && (e as NodeJS.ErrnoException).code === 'ENOENT') {
        return ok({ sessions: [] });
      }
      return err({
        code: 'FILE_NOT_FOUND',
        message: `Failed to read session index: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
  } catch (error) {
    return err({
      code: 'FILE_NOT_FOUND',
      message: `Failed to load session index: ${error}`,
    });
  }
}

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

export async function createSession(projectPath: string): Promise<Result<SessionData>> {
  try {
    const id = randomUUID();
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

    const sessionDir = getSessionDir(id);
    await ensureDir(sessionDir);
    await writeFile(`${sessionDir}/metadata.json`, JSON.stringify(metadata, null, 2), 'utf-8');
    await writeFile(`${sessionDir}/messages.json`, JSON.stringify([], null, 2), 'utf-8');

    const indexResult = await loadSessionIndex();
    if (!indexResult.ok) return indexResult;

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
    if (!saveResult.ok) return saveResult;

    return ok(sessionData);
  } catch (error) {
    return err({
      code: 'API_ERROR',
      message: `Failed to create session: ${error}`,
    });
  }
}

export async function loadSession(sessionId: string): Promise<Result<SessionData>> {
  try {
    const sessionDir = getSessionDir(sessionId);
    const metadataContent = await readFile(`${sessionDir}/metadata.json`, 'utf-8');
    const rawMetadata = JSON.parse(metadataContent);

    const metadataResult = SessionMetadataSchema.safeParse(rawMetadata);
    if (!metadataResult.success) {
      return err({
        code: 'SCHEMA_VALIDATION',
        message: `Invalid session metadata: ${metadataResult.error.message}`,
      });
    }

    const messagesContent = await readFile(`${sessionDir}/messages.json`, 'utf-8');
    const rawMessages = JSON.parse(messagesContent);

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

export async function addMessageToSession(
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<Result<ChatMessage>> {
  try {
    const sessionDir = getSessionDir(sessionId);
    const messagesContent = await readFile(`${sessionDir}/messages.json`, 'utf-8');
    const parseResult = MessagesArraySchema.safeParse(JSON.parse(messagesContent));
    if (!parseResult.success) {
      return err({
        code: 'SCHEMA_VALIDATION',
        message: `Invalid messages format: ${parseResult.error.message}`,
      });
    }
    const messages = parseResult.data;

    const newMessage: ChatMessage = {
      ...message,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];
    await writeFile(`${sessionDir}/messages.json`, JSON.stringify(updatedMessages, null, 2), 'utf-8');

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

export async function deleteSession(sessionId: string): Promise<Result<void>> {
  try {
    const { rm } = await import('node:fs/promises');
    const sessionDir = getSessionDir(sessionId);
    await rm(sessionDir, { recursive: true, force: true });

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

export async function listAllSessions(): Promise<Result<readonly SessionIndexEntry[]>> {
  const indexResult = await loadSessionIndex();
  if (!indexResult.ok) return indexResult;
  return ok(indexResult.data.sessions);
}
