'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { ChatMessage } from '../storage/types.js';
import { addMessageToSession, loadSession } from '../storage/session-store.js';
import { useSession } from './session-context.js';

export interface ChatContextValue {
  messages: readonly ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { activeSession, setActiveSession, setError } = useSession();

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
