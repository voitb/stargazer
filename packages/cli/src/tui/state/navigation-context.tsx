'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

export type Screen =
  | 'home'
  | 'chat'
  | 'history'
  | 'settings'
  | 'help'
  | 'review'
  | 'loading'
  | 'error'
  | 'providerSelect'
  | 'apiKeySetup'
  | 'modelSelect';

export interface NavigationContextValue {
  screen: Screen;
  navigate: (screen: Screen) => void;
  goBack: () => void;
  history: readonly Screen[];
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
  initialScreen?: Screen;
}

export function NavigationProvider({
  children,
  initialScreen = 'home',
}: NavigationProviderProps) {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [history, setHistory] = useState<Screen[]>([initialScreen]);

  const navigate = useCallback((newScreen: Screen) => {
    setHistory(prev => [...prev, newScreen]);
    setScreen(newScreen);
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length <= 1) {
        return prev;
      }
      const newHistory = prev.slice(0, -1);
      const previousScreen = newHistory[newHistory.length - 1] ?? 'home';
      setScreen(previousScreen);
      return newHistory;
    });
  }, []);

  const value = useMemo(
    () => ({ screen, navigate, goBack, history }),
    [screen, navigate, goBack, history]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
