import { useState, useCallback, useEffect } from 'react';
import { Box, useApp } from 'ink';
import { basename } from 'node:path';
import { StatusBar, Header, TUIErrorBoundary } from './components/index.js';
import { AppProvider, useAppContext } from './state/app-context.js';
import { hasApiKey } from './storage/api-key-store.js';
import { ScreenRouter } from './screens/screen-router.js';
import { useAppReview } from './hooks/use-app-review.js';
import { useAppKeyboard } from './hooks/use-app-keyboard.js';
import { useTokenTracking } from './hooks/use-token-tracking.js';
import { ThemeProvider } from './design-system/index.js';

interface AppContentProps {
  projectPath: string;
}

function AppContent({ projectPath }: AppContentProps) {
  const { exit } = useApp();
  const {
    screen,
    navigate,
    goBack,
    error: appError,
    setError: setAppError,
    refreshSessions,
    sessions,
    activeSession,
  } = useAppContext();

  const review = useAppReview({ projectPath });

  // Track token usage for the active session
  // Note: Sessions don't store model per-session yet, using default model
  // TODO: Add model to SessionMetadata when multi-model support is added
  const tokenUsage = useTokenTracking(
    activeSession?.messages ?? [],
    'gemini-1.5-pro'
  );

  const [apiKeyStatus, setApiKeyStatus] = useState<boolean | undefined>(undefined);

  // Derive the effective error (review errors take precedence)
  const error = review.error || appError;

  // Initialize app state
  useEffect(() => {
    const init = async () => {
      const hasKey = await hasApiKey();
      setApiKeyStatus(hasKey);
      if (!hasKey) {
        navigate('providerSelect');
      }
      await refreshSessions();
    };
    init().catch(e => setAppError(e instanceof Error ? e.message : String(e)));
  }, [navigate, refreshSessions, setAppError]);

  // Refresh API key status when returning to home
  useEffect(() => {
    if (screen === 'home') {
      hasApiKey().then(setApiKeyStatus);
    }
  }, [screen]);

  const goToMenu = useCallback(() => {
    navigate('home');
    review.clearResult();
    review.clearError();
    setAppError(null);
  }, [navigate, review, setAppError]);

  const goToProviderSelect = useCallback(() => {
    review.clearError();
    setAppError(null);
    navigate('providerSelect');
  }, [navigate, review, setAppError]);

  const handleMenuSelect = useCallback((value: string) => {
    switch (value) {
      case 'exit':
        exit();
        break;
      case 'review-staged':
        review.reviewStaged();
        break;
      case 'review-unstaged':
        review.reviewUnstaged();
        break;
      case 'review-files':
        navigate('fileSelect');
        break;
      case 'history':
        navigate('history');
        break;
      case 'settings':
        navigate('settings');
        break;
      case 'help':
        navigate('help');
        break;
      case 'discover':
      case 'continue':
        setAppError('This feature is coming soon!');
        navigate('error');
        break;
    }
  }, [exit, review, navigate, setAppError]);

  // Keyboard handling
  useAppKeyboard({
    screen,
    apiKeyStatus,
    onCancelReview: review.handleCancel,
    onGoToMenu: goToMenu,
    onGoBack: goBack,
    onGoToProviderSelect: goToProviderSelect,
  });

  const projectName = basename(projectPath) || 'Unknown';

  const statusMessage = screen === 'home'
    ? 'Press Q or Ctrl+C to exit'
    : screen === 'loading'
    ? `AI review in progress... (${review.elapsedTime}s) • ESC to cancel`
    : 'Press ESC or B to go back';

  return (
    <Box flexDirection="column" minHeight={10}>
      <Header projectName={projectName} />
      <Box flexDirection="column" flexGrow={1}>
        <ScreenRouter
          screen={screen}
          review={{
            result: review.result,
            phase: review.phase,
            completedPhases: review.completedPhases,
            elapsedTime: review.elapsedTime,
            timeout: review.timeout,
          }}
          error={error}
          onMenuSelect={handleMenuSelect}
        />
      </Box>
      <StatusBar
        message={statusMessage}
        sessionCount={sessions.length}
        hasApiKey={apiKeyStatus}
        tokenUsage={activeSession ? { current: tokenUsage.current, limit: tokenUsage.limit } : undefined}
      />
    </Box>
  );
}

interface AppProps {
  projectPath: string;
}

export function App({ projectPath }: AppProps) {
  return (
    <TUIErrorBoundary>
      <ThemeProvider>
        <AppProvider projectPath={projectPath}>
          <AppContent projectPath={projectPath} />
        </AppProvider>
      </ThemeProvider>
    </TUIErrorBoundary>
  );
}
