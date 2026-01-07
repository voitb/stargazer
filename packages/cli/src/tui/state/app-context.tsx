import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SessionData, SessionIndexEntry, ChatMessage } from '../storage/types.js';
import {
  createSession,
  loadSession,
  addMessageToSession,
  listAllSessions,
} from '../storage/session-store.js';

export type Screen = 'home' | 'chat' | 'history' | 'settings' | 'help' | 'review' | 'loading' | 'error' | 'providerSelect' | 'apiKeySetup' | 'modelSelect';

export interface AppContextValue {
  screen: Screen;
  navigate: (screen: Screen) => void;
  activeSession: SessionData | null;
  sessions: readonly SessionIndexEntry[];
  startNewSession: () => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  closeSession: () => void;
  refreshSessions: () => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  projectPath: string;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
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
    } else {
      setError(`Failed to load sessions: ${result.error.message}`);
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
    if (!result.ok) {
      setError(`Failed to save message: ${result.error.message}`);
      return;
    }

    const sessionResult = await loadSession(activeSession.metadata.id);
    if (sessionResult.ok) {
      setActiveSession(sessionResult.data);
    } else {
      setError(`Failed to reload session: ${sessionResult.error.message}`);
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
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
