import { useCallback } from 'react';
import { useApp, useInput } from 'ink';
import type { Screen } from '../state/navigation-context.js';

interface UseAppKeyboardOptions {
  screen: Screen;
  apiKeyStatus: boolean | undefined;
  onCancelReview: () => void;
  onGoToMenu: () => void;
  onGoBack: () => void;
  onGoToProviderSelect: () => void;
}

/**
 * Centralized keyboard handling for the app.
 * Handles Ctrl+C, Q to quit, ESC/B for navigation.
 */
export function useAppKeyboard({
  screen,
  apiKeyStatus,
  onCancelReview,
  onGoToMenu,
  onGoBack,
  onGoToProviderSelect,
}: UseAppKeyboardOptions): void {
  const { exit } = useApp();

  useInput(
    useCallback(
      (input, key) => {
        // Global: Ctrl+C exits
        if (input === 'c' && key.ctrl) {
          exit();
          return;
        }

        // Home screen: Q exits
        if (screen === 'home' && input === 'q') {
          exit();
          return;
        }

        // Loading screen: ESC cancels review
        if (screen === 'loading' && key.escape) {
          onCancelReview();
          return;
        }

        // Error screen: ESC/B goes back (context-dependent)
        if (screen === 'error' && (key.escape || input === 'b')) {
          if (apiKeyStatus) {
            onGoToMenu();
          } else {
            onGoToProviderSelect();
          }
          return;
        }

        // Standard screens: ESC/B goes back in history
        const backScreens: Screen[] = ['review', 'settings', 'help', 'history'];
        if (backScreens.includes(screen) && (key.escape || input === 'b')) {
          onGoBack();
          return;
        }
      },
      [screen, apiKeyStatus, exit, onCancelReview, onGoToMenu, onGoBack, onGoToProviderSelect]
    )
  );
}
