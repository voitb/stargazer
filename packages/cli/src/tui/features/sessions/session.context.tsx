'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { SessionData, SessionIndexEntry } from '../../storage/types.js';
import {
  createSession,
  loadSession,
  listAllSessions,
} from '../../storage/session-store.js';
import { useNavigation } from '../../state/navigation-context.js';

export interface SessionContextValue {
  projectPath: string;
  activeSession: SessionData | null;
  sessions: readonly SessionIndexEntry[];
  startNewSession: () => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  closeSession: () => void;
  refreshSessions: () => Promise<void>;
  setActiveSession: (session: SessionData | null) => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  children: ReactNode;
  projectPath: string;
}

export function SessionProvider({ children, projectPath }: SessionProviderProps) {
  const { navigate } = useNavigation();
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);
  const [sessions, setSessions] = useState<readonly SessionIndexEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      navigate('chat');
      await refreshSessions();
    } else {
      setError(result.error.message);
    }

    setIsLoading(false);
  }, [projectPath, navigate, refreshSessions]);

  const resumeSession = useCallback(
    async (sessionId: string) => {
      setIsLoading(true);
      setError(null);

      const result = await loadSession(sessionId);
      if (result.ok) {
        setActiveSession(result.data);
        navigate('chat');
      } else {
        setError(result.error.message);
      }

      setIsLoading(false);
    },
    [navigate]
  );

  const closeSession = useCallback(() => {
    setActiveSession(null);
    navigate('home');
  }, [navigate]);

  const value = useMemo(
    () => ({
      projectPath,
      activeSession,
      sessions,
      startNewSession,
      resumeSession,
      closeSession,
      refreshSessions,
      setActiveSession,
      isLoading,
      error,
      setError,
    }),
    [
      projectPath,
      activeSession,
      sessions,
      startNewSession,
      resumeSession,
      closeSession,
      refreshSessions,
      isLoading,
      error,
    ]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
