---
id: task-101
title: Create React context for app state
status: pending
priority: high
labels:
  - cli
  - tui
  - state
created: '2025-01-06'
order: 101
assignee: glm
---

## Description

Create the React context provider for managing global TUI application state including navigation, sessions, and messages.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/state/app-context.tsx`
- [ ] Define `Screen` type for navigation states
- [ ] Create `AppProvider` component with state management
- [ ] Implement `useApp()` hook for consuming context
- [ ] Implement navigation, session management, and message functions

## Implementation

**File**: `packages/cli/src/tui/state/app-context.tsx`

```typescript
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SessionData, SessionIndexEntry, ChatMessage } from '../storage/types.js';
import {
  createSession,
  loadSession,
  addMessageToSession,
  listAllSessions,
} from '../storage/session-store.js';

/**
 * Available screens in the TUI
 */
export type Screen = 'home' | 'chat' | 'history' | 'settings' | 'help';

/**
 * App context value interface
 */
interface AppContextValue {
  // Navigation
  screen: Screen;
  navigate: (screen: Screen) => void;

  // Session
  activeSession: SessionData | null;
  sessions: readonly SessionIndexEntry[];
  startNewSession: () => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  closeSession: () => void;
  refreshSessions: () => Promise<void>;

  // Messages
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;

  // Project
  projectPath: string;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: ReactNode;
  projectPath: string;
}

export function AppProvider({ children, projectPath }: AppProviderProps) {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);
  const [sessions, setSessions] = useState<readonly SessionIndexEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useCallback((newScreen: Screen) => {
    setScreen(newScreen);
  }, []);

  const refreshSessions = useCallback(async () => {
    const result = await listAllSessions();
    if (result.ok) {
      setSessions(result.data);
    }
  }, []);

  const startNewSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await createSession(projectPath);
    if (result.ok) {
      setActiveSession(result.data);
      setScreen('chat');
      await refreshSessions();
    } else {
      setError(result.error.message);
    }

    setIsLoading(false);
  }, [projectPath, refreshSessions]);

  const resumeSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    const result = await loadSession(sessionId);
    if (result.ok) {
      setActiveSession(result.data);
      setScreen('chat');
    } else {
      setError(result.error.message);
    }

    setIsLoading(false);
  }, []);

  const closeSession = useCallback(() => {
    setActiveSession(null);
    setScreen('home');
  }, []);

  const addMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!activeSession) return;

    const result = await addMessageToSession(activeSession.metadata.id, message);
    if (result.ok) {
      // Reload session to get updated messages
      const sessionResult = await loadSession(activeSession.metadata.id);
      if (sessionResult.ok) {
        setActiveSession(sessionResult.data);
      }
    }
  }, [activeSession]);

  const value: AppContextValue = {
    screen,
    navigate,
    activeSession,
    sessions,
    startNewSession,
    resumeSession,
    closeSession,
    refreshSessions,
    addMessage,
    projectPath,
    isLoading,
    error,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
