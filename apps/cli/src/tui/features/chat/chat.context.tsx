'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { ChatMessage, SessionData } from '../../storage/types.js';
import { addMessageToSession, loadSession } from '../../storage/session-store.js';

export interface ChatContextValue {
  messages: readonly ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

/**
 * Session interface that ChatProvider needs.
 * Passed from the app layer to avoid cross-feature imports.
 */
interface SessionInterface {
  activeSession: SessionData | null;
  setActiveSession: (session: SessionData | null) => void;
  setError: (error: string | null) => void;
}

interface ChatProviderProps {
  children: ReactNode;
  session: SessionInterface;
}

export function ChatProvider({ children, session }: ChatProviderProps) {
  const { activeSession, setActiveSession, setError } = session;

  const messages = activeSession?.messages ?? [];

  const addMessage = useCallback(
    async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
      if (!activeSession) return;

      const result = await addMessageToSession(activeSession.metadata.id, message);
      if (!result.ok) {
        setError(`Failed to save message: ${result.error.message}`);
        return;
      }

      // Reload session to get updated messages
      const sessionResult = await loadSession(activeSession.metadata.id);
      if (sessionResult.ok) {
        setActiveSession(sessionResult.data);
      } else {
        setError(`Failed to reload session: ${sessionResult.error.message}`);
      }
    },
    [activeSession, setActiveSession, setError]
  );

  const value = useMemo(
    () => ({ messages, addMessage }),
    [messages, addMessage]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
