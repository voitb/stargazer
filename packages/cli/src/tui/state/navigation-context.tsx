import { createContext, useContext, useReducer, useCallback, useMemo, type ReactNode } from 'react';

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
  | 'modelSelect'
  | 'fileSelect';

export interface NavigationContextValue {
  screen: Screen;
  navigate: (screen: Screen) => void;
  goBack: () => void;
  history: readonly Screen[];
}

// Maximum history size to prevent unbounded growth
const MAX_HISTORY_SIZE = 50;

// State and action types for the reducer
type NavigationState = {
  screen: Screen;
  history: Screen[];
};

type NavigationAction =
  | { type: 'NAVIGATE'; payload: Screen }
  | { type: 'GO_BACK' };

/**
 * Pure reducer function for navigation state.
 * Handles both screen and history atomically to prevent sync issues.
 */
function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'NAVIGATE': {
      const newHistory = [...state.history, action.payload];
      return {
        screen: action.payload,
        // Limit history size to prevent memory issues in long-running sessions
        history: newHistory.length > MAX_HISTORY_SIZE
          ? newHistory.slice(-MAX_HISTORY_SIZE)
          : newHistory,
      };
    }
    case 'GO_BACK': {
      if (state.history.length <= 1) {
        return state;
      }
      const newHistory = state.history.slice(0, -1);
      return {
        screen: newHistory[newHistory.length - 1] ?? 'home',
        history: newHistory,
      };
    }
    default: {
      // Exhaustive check - TypeScript will error if a new action type is added but not handled
      const _exhaustiveCheck: never = action;
      return _exhaustiveCheck;
    }
  }
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
  const [state, dispatch] = useReducer(navigationReducer, {
    screen: initialScreen,
    history: [initialScreen],
  });

  const navigate = useCallback((newScreen: Screen) => {
    dispatch({ type: 'NAVIGATE', payload: newScreen });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, []);

  const value = useMemo(
    () => ({ screen: state.screen, navigate, goBack, history: state.history }),
    [state.screen, state.history, navigate, goBack]
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
    throw new Error(
      'useNavigation must be used within a NavigationProvider. ' +
        'Wrap your app in <NavigationProvider> at the root level.'
    );
  }
  return context;
}
