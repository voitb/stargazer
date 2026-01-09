'use client';

import { type ReactNode } from 'react';
import {
  NavigationProvider,
  useNavigation,
  type Screen,
} from './navigation-context.js';
import { SessionProvider, useSession } from '../features/sessions/session.context.js';
import { ChatProvider, useChat } from '../features/chat/chat.context.js';
import type { SessionData, SessionIndexEntry, ChatMessage } from '../storage/types.js';

// Re-export types for backwards compatibility
export type { Screen };

/**
 * Combined context value for backwards compatibility.
 * New code should use the individual hooks:
 * - useNavigation() for screen navigation
 * - useSession() for session management
 * - useChat() for chat messages
 */
export interface AppContextValue {
  // Navigation
  screen: Screen;
  navigate: (screen: Screen) => void;
  goBack: () => void;
  history: readonly Screen[];
  // Session
  activeSession: SessionData | null;
  sessions: readonly SessionIndexEntry[];
  startNewSession: () => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  closeSession: () => void;
  refreshSessions: () => Promise<void>;
  // Chat
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  // Shared
  projectPath: string;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

interface AppProviderProps {
  children: ReactNode;
  projectPath: string;
}

/**
 * Combined provider that wraps all three focused providers.
 * This maintains backwards compatibility with existing code.
 */
export function AppProvider({ children, projectPath }: AppProviderProps) {
  return (
    <NavigationProvider>
      <SessionProvider projectPath={projectPath}>
        <ChatProvider>{children}</ChatProvider>
      </SessionProvider>
    </NavigationProvider>
  );
}

/**
 * Combined hook for backwards compatibility.
 * New code should prefer the individual hooks for better performance:
 * - useNavigation() - only re-renders on navigation changes
 * - useSession() - only re-renders on session changes
 * - useChat() - only re-renders on message changes
 */
export function useAppContext(): AppContextValue {
  const navigation = useNavigation();
  const session = useSession();
  const chat = useChat();

  return {
    // Navigation
    screen: navigation.screen,
    navigate: navigation.navigate,
    goBack: navigation.goBack,
    history: navigation.history,
    // Session
    activeSession: session.activeSession,
    sessions: session.sessions,
    startNewSession: session.startNewSession,
    resumeSession: session.resumeSession,
    closeSession: session.closeSession,
    refreshSessions: session.refreshSessions,
    // Chat
    addMessage: chat.addMessage,
    // Shared (from session context)
    projectPath: session.projectPath,
    isLoading: session.isLoading,
    error: session.error,
    setError: session.setError,
  };
}

// Re-export individual hooks for new code
export { useNavigation, useSession, useChat };
export { NavigationProvider, SessionProvider, ChatProvider };
