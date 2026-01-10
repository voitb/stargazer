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

export type { Screen };

/**
 * Combined context value providing unified access to all app state.
 *
 * This is the primary API for accessing app state throughout the TUI.
 * For performance-critical components that need selective re-renders,
 * consider using the individual hooks instead:
 * - useNavigation() - only re-renders on navigation changes
 * - useSession() - only re-renders on session changes
 * - useChat() - only re-renders on message changes
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
  clearMessages: () => Promise<void>;
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
 * Internal wrapper that passes session data to ChatProvider.
 * This bridges the session and chat contexts without cross-feature imports.
 */
function ChatProviderWrapper({ children }: { children: ReactNode }) {
  const session = useSession();
  return (
    <ChatProvider
      session={{
        activeSession: session.activeSession,
        setActiveSession: session.setActiveSession,
        setError: session.setError,
      }}
    >
      {children}
    </ChatProvider>
  );
}

/**
 * Combined provider that composes navigation, session, and chat contexts.
 * Use this at the app root to provide state to all screens.
 */
export function AppProvider({ children, projectPath }: AppProviderProps) {
  return (
    <NavigationProvider>
      <SessionProvider projectPath={projectPath}>
        <ChatProviderWrapper>{children}</ChatProviderWrapper>
      </SessionProvider>
    </NavigationProvider>
  );
}

/**
 * Primary hook for accessing app state.
 *
 * Provides unified access to navigation, session, and chat state.
 * For performance-critical components, use individual hooks instead:
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
    clearMessages: session.clearMessages,
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
