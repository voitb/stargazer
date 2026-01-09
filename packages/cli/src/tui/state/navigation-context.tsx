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

  const navigate = useCallback((newScreen: Screen) => {
    setScreen(newScreen);
  }, []);

  const value = useMemo(
    () => ({ screen, navigate }),
    [screen, navigate]
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
