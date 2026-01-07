import { useState, useCallback, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { Spinner } from '@inkjs/ui';
import { basename } from 'node:path';
import { StatusBar } from './components/status-bar.js';
import { MainMenu } from './components/main-menu.js';
import { Header } from './components/header.js';
import { ReviewView } from './components/review-view.js';
import { AppProvider, useAppContext } from './state/app-context.js';
import { hasApiKey } from './storage/api-key-store.js';
import { HomeScreen, ChatScreen, HistoryScreen, HelpScreen, ProviderSelectScreen, SettingsScreen, ApiKeySetupScreen, ModelSelectScreen } from './screens/index.js';
import { useReview, PHASE_ORDER, type ReviewPhase } from './hooks/use-review.js';

function getPhaseLabel(phase: ReviewPhase): string {
  switch (phase) {
    case 'preparing': return 'Preparing review...';
    case 'fetching-diff': return 'Fetching git diff...';
    case 'analyzing': return 'Analyzing with AI...';
    case 'parsing': return 'Parsing response...';
  }
}

interface ProgressPhasesProps {
  currentPhase: ReviewPhase | null;
  completedPhases: ReviewPhase[];
}

function ProgressPhases({ currentPhase, completedPhases }: ProgressPhasesProps) {
  return (
    <Box flexDirection="column">
      {PHASE_ORDER.map(phase => {
        const isCompleted = completedPhases.includes(phase);
        const isCurrent = phase === currentPhase;
        const isPending = !isCompleted && !isCurrent;

        return (
          <Box key={phase}>
            {isCompleted && <Text color="green">✓ </Text>}
            {isCurrent && <><Spinner /><Text> </Text></>}
            {isPending && <Text dimColor>○ </Text>}
            <Text
              color={isCompleted ? 'green' : isCurrent ? 'yellow' : undefined}
              dimColor={isPending}
            >
              {getPhaseLabel(phase)}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

function getUserFriendlyError(errorMsg: string): { title: string; message: string; suggestion: string } {
  const lower = errorMsg.toLowerCase();

  if (lower.includes('timed out') || lower.includes('timeout')) {
    return {
      title: 'Request Timed Out',
      message: 'The AI review took too long to complete.',
      suggestion: 'Try reviewing fewer files, or increase timeout in Settings.',
    };
  }
  if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('invalid api key')) {
    return {
      title: 'Authentication Failed',
      message: 'Your API key appears to be invalid.',
      suggestion: 'Go to Settings to update your API key.',
    };
  }
  if (lower.includes('429') || lower.includes('rate limit')) {
    return {
      title: 'Rate Limited',
      message: 'Too many requests to the Gemini API.',
      suggestion: 'Wait a moment and try again.',
    };
  }
  if (lower.includes('no changes') || lower.includes('empty') || lower.includes('no diff')) {
    return {
      title: 'No Changes Found',
      message: 'No staged/unstaged changes detected.',
      suggestion: 'Make sure you have changes to review.',
    };
  }
  if (lower.includes('cancelled') || lower.includes('aborted')) {
    return {
      title: 'Review Cancelled',
      message: 'The review was cancelled.',
      suggestion: 'Press ESC to go back to the menu.',
    };
  }
  if (lower.includes('connection') || lower.includes('econnrefused') || lower.includes('etimedout') || lower.includes('fetch failed') || lower.includes('network')) {
    return {
      title: 'Connection Failed',
      message: 'Could not connect to the AI service.',
      suggestion: 'Check your internet connection and try again.',
    };
  }
  return {
    title: 'Error',
    message: errorMsg,
    suggestion: 'Press ESC to go back and try again.',
  };
}

interface AppContentProps {
  projectPath: string;
}

function AppContent({ projectPath }: AppContentProps) {
  const { exit } = useApp();
  const {
    screen,
    navigate,
    error: appError,
    setError: setAppError,
    refreshSessions,
    sessions,
  } = useAppContext();

  const {
    isReviewing,
    error: reviewError,
    result: reviewResult,
    phase: reviewPhase,
    completedPhases,
    timeout: configuredTimeout,
    reviewStaged,
    reviewUnstaged,
    cancel: cancelReview,
    clearResult,
    clearError: clearReviewError,
  } = useReview({ projectPath });

  const [apiKeyStatus, setApiKeyStatus] = useState<boolean | undefined>(undefined);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Derive the effective error (review errors take precedence)
  const error = reviewError || appError;

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

  useEffect(() => {
    if (screen === 'home') {
      hasApiKey().then(setApiKeyStatus);
    }
  }, [screen]);

  // Track elapsed time during review
  useEffect(() => {
    if (!isReviewing) {
      setElapsedTime(0);
      return;
    }
    const interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isReviewing]);

  // Navigate based on review state changes
  useEffect(() => {
    if (isReviewing && screen !== 'loading') {
      navigate('loading');
    } else if (!isReviewing && reviewResult && screen === 'loading') {
      navigate('review');
    } else if (!isReviewing && reviewError && screen === 'loading') {
      navigate('error');
    }
  }, [isReviewing, reviewResult, reviewError, screen, navigate]);

  const handleCancelReview = useCallback(() => {
    cancelReview();
    navigate('home');
  }, [cancelReview, navigate]);

  const handleMenuSelect = useCallback((value: string) => {
    switch (value) {
      case 'exit':
        exit();
        break;
      case 'review-staged':
        reviewStaged();
        break;
      case 'review-unstaged':
        reviewUnstaged();
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
  }, [exit, reviewStaged, reviewUnstaged, navigate, setAppError]);

  const goToMenu = useCallback(() => {
    navigate('home');
    clearResult();
    clearReviewError();
    setAppError(null);
  }, [navigate, clearResult, clearReviewError, setAppError]);

  useInput((input, key) => {
    if (input === 'c' && key.ctrl) {
      exit();
    }
    if (screen === 'home' && input === 'q') {
      exit();
    }
    if (screen === 'loading' && key.escape) {
      handleCancelReview();
    }
    if (screen === 'error' && (key.escape || input === 'b')) {
      if (apiKeyStatus) {
        goToMenu();
      } else {
        clearReviewError();
        setAppError(null);
        navigate('providerSelect');
      }
    }
    if (screen === 'review' && (key.escape || input === 'b')) {
      goToMenu();
    }
  });

  const projectName = basename(projectPath) || 'Unknown';

  const renderContent = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen onSelect={handleMenuSelect} />;

      case 'chat':
        return <ChatScreen />;

      case 'loading':
        return (
          <Box padding={1} flexDirection="column">
            <ProgressPhases
              currentPhase={reviewPhase}
              completedPhases={completedPhases}
            />
            <Box marginTop={1}>
              <Text dimColor>
                Elapsed: {elapsedTime}s | Press ESC to cancel
              </Text>
            </Box>
          </Box>
        );

      case 'review':
        return reviewResult ? (
          <ReviewView result={reviewResult} onBack={goToMenu} />
        ) : null;

      case 'history':
        return <HistoryScreen />;

      case 'help':
        return <HelpScreen />;

      case 'settings':
        return <SettingsScreen />;

      case 'providerSelect':
        return <ProviderSelectScreen />;

      case 'apiKeySetup':
        return <ApiKeySetupScreen />;

      case 'modelSelect':
        return <ModelSelectScreen />;

      case 'error': {
        const errorInfo = getUserFriendlyError(error || 'Unknown error');
        return (
          <Box padding={1} flexDirection="column">
            <Text color="red" bold>{errorInfo.title}</Text>
            <Box marginTop={1}>
              <Text color="red">{errorInfo.message}</Text>
            </Box>
            <Box marginTop={1}>
              <Text color="yellow">💡 {errorInfo.suggestion}</Text>
            </Box>
            <Box marginTop={2}>
              <Text dimColor>Press ESC or B to go back</Text>
            </Box>
          </Box>
        );
      }

      default:
        return <MainMenu onSelect={handleMenuSelect} />;
    }
  };

  const statusMessage = screen === 'home'
    ? 'Press Q or Ctrl+C to exit'
    : screen === 'loading'
    ? `AI review in progress... (${elapsedTime}s) • ESC to cancel`
    : 'Press ESC or B to go back';

  return (
    <Box flexDirection="column" minHeight={10}>
      <Header projectName={projectName} />
      <Box flexDirection="column" flexGrow={1}>
        {renderContent()}
      </Box>
      <StatusBar message={statusMessage} sessionCount={sessions.length} hasApiKey={apiKeyStatus} />
    </Box>
  );
}

interface AppProps {
  projectPath: string;
}

export function App({ projectPath }: AppProps) {
  return (
    <AppProvider projectPath={projectPath}>
      <AppContent projectPath={projectPath} />
    </AppProvider>
  );
}
