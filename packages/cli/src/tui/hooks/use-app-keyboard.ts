import { useCallback } from 'react';
import { useApp, useInput } from 'ink';
import type { Screen } from '../state/navigation-context.js';
import { matchesAction } from '../config/keymaps.js';

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
 *
 * Supports both standard and vim-style navigation:
 * - Ctrl+C: Exit (global)
 * - Q: Quit (home screen only)
 * - ESC/B/←/h: Back navigation
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
        // Global: Ctrl+C always exits
        if (input === 'c' && key.ctrl) {
          exit();
          return;
        }

        // Home screen: Q exits (using matchesAction for consistency)
        if (screen === 'home' && matchesAction(input, key, 'app.quit')) {
          exit();
          return;
        }

        // Loading screen: ESC cancels review
        if (screen === 'loading' && matchesAction(input, key, 'app.cancel')) {
          onCancelReview();
          return;
        }

        // Error screen: Back navigation (context-dependent destination)
        if (screen === 'error' && matchesAction(input, key, 'nav.back')) {
          if (apiKeyStatus) {
            onGoToMenu();
          } else {
            onGoToProviderSelect();
          }
          return;
        }

        // Standard screens: Back navigation (ESC/B/←/h)
        const backScreens: Screen[] = ['review', 'settings', 'help', 'history', 'chat'];
        if (backScreens.includes(screen) && matchesAction(input, key, 'nav.back')) {
          onGoBack();
          return;
        }
      },
      [screen, apiKeyStatus, exit, onCancelReview, onGoToMenu, onGoBack, onGoToProviderSelect]
    )
  );
}
