import { useState, useCallback } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { Spinner } from '@inkjs/ui';
import { basename } from 'node:path';
import { createGeminiClient } from '@stargazer/core/gemini/client';
import { reviewDiff } from '@stargazer/core/review/reviewer';
import type { ReviewResult } from '@stargazer/core';
import { StatusBar } from './components/status-bar.js';
import { MainMenu } from './components/main-menu.js';
import { Header } from './components/header.js';
import { ReviewView } from './components/review-view.js';

type Screen = 'menu' | 'loading' | 'review' | 'error';

interface AppProps {
  projectPath: string;
}

export function App({ projectPath }: AppProps) {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('menu');
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const goToMenu = useCallback(() => {
    setScreen('menu');
    setReviewResult(null);
    setError(null);
  }, []);

  const runReview = useCallback(async (staged: boolean) => {
    const apiKey = process.env['GEMINI_API_KEY'] || process.env['GOOGLE_API_KEY'];

    if (!apiKey) {
      setError('GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required');
      setScreen('error');
      return;
    }

    setScreen('loading');
    setLoadingMessage(staged ? 'Reviewing staged changes...' : 'Reviewing unstaged changes...');

    try {
      const client = createGeminiClient(apiKey);
      const result = await reviewDiff(client, {
        staged,
        projectPath,
      });

      if (!result.ok) {
        setError(result.error.message);
        setScreen('error');
        return;
      }

      setReviewResult(result.data);
      setScreen('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setScreen('error');
    }
  }, [projectPath]);

  const handleMenuSelect = useCallback((value: string) => {
    switch (value) {
      case 'exit':
        exit();
        break;
      case 'review-staged':
        runReview(true);
        break;
      case 'review-unstaged':
        runReview(false);
        break;
      case 'discover':
      case 'continue':
      case 'history':
      case 'help':
        break;
    }
  }, [exit, runReview]);

  useInput((input, key) => {
    if (input === 'c' && key.ctrl) {
      exit();
    }
    if (screen === 'menu' && input === 'q') {
      exit();
    }
    if ((screen === 'review' || screen === 'error') && (key.escape || input === 'b')) {
      goToMenu();
    }
  });

  const projectName = basename(projectPath) || 'Unknown';

  const renderContent = () => {
    switch (screen) {
      case 'menu':
        return <MainMenu onSelect={handleMenuSelect} />;

      case 'loading':
        return (
          <Box padding={1} flexDirection="column">
            <Box>
              <Spinner label={loadingMessage} />
            </Box>
            <Box marginTop={1}>
              <Text dimColor>This may take a moment...</Text>
            </Box>
          </Box>
        );

      case 'review':
        return reviewResult ? (
          <ReviewView result={reviewResult} onBack={goToMenu} />
        ) : null;

      case 'error':
        return (
          <Box padding={1} flexDirection="column">
            <Text color="red" bold>❌ Error</Text>
            <Box marginTop={1}>
              <Text color="red">{error}</Text>
            </Box>
            <Box marginTop={2}>
              <Text dimColor>Press ESC or B to go back to menu</Text>
            </Box>
          </Box>
        );

      default:
        return <MainMenu onSelect={handleMenuSelect} />;
    }
  };

  const statusMessage = screen === 'menu'
    ? 'Press Q or Ctrl+C to exit'
    : screen === 'loading'
    ? 'Please wait...'
    : 'Press ESC or B to go back';

  return (
    <Box flexDirection="column" minHeight={10}>
      <Header projectName={projectName} />
      <Box flexDirection="column" flexGrow={1}>
        {renderContent()}
      </Box>
      <StatusBar message={statusMessage} />
    </Box>
  );
}
