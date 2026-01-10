import { Box, Text } from 'ink';
import { HomeScreen } from './home-screen.js';
import { HelpScreen } from './help-screen.js';
import { ChatScreen } from '../features/chat/chat-screen.js';
import { HistoryScreen } from '../features/sessions/history-screen.js';
import { SettingsScreen } from '../features/settings/settings-screen.js';
import {
  ProviderSelectScreen,
  ModelSelectScreen,
  ApiKeySetupScreen,
} from '../features/auth/index.js';
import { ReviewView, ProgressPhases, PHASE_ORDER, FileSelectScreen } from '../features/review/index.js';
import { MainMenu } from '../components/index.js';
import { getUserFriendlyError } from '../utils/error-messages.js';
import { StatusText, HintText, ProgressBar, UsageDisplay } from '../design-system/index.js';
import type { Screen } from '../state/navigation-context.js';
import type { ReviewResult } from '@stargazer/core';
import type { ReviewPhase } from '../features/review/types.js';
import type { ReviewActions } from '../types/review.js';

interface ScreenRouterProps {
  screen: Screen;
  review: {
    result: ReviewResult | null;
    phase: ReviewPhase | null;
    completedPhases: readonly ReviewPhase[];
    elapsedTime: number;
    timeout: number;
  };
  reviewActions: ReviewActions;
  error: string | null;
  onMenuSelect: (value: string) => void;
}

export function ScreenRouter({
  screen,
  review,
  reviewActions,
  error,
  onMenuSelect,
}: ScreenRouterProps) {
  switch (screen) {
    case 'home':
      return <HomeScreen onSelect={onMenuSelect} />;

    case 'chat':
      return <ChatScreen reviewActions={reviewActions} />;

    case 'loading': {
      const completedCount = review.completedPhases.length;
      const totalPhases = PHASE_ORDER.length;

      return (
        <Box padding={1} flexDirection="column">
          <ProgressPhases
            currentPhase={review.phase}
            completedPhases={review.completedPhases}
          />
          <Box marginTop={1}>
            <ProgressBar
              current={completedCount}
              total={totalPhases}
              width={24}
              showLabel
              showPercentage
            />
          </Box>
          <Box marginTop={1}>
            <UsageDisplay
              current={review.elapsedTime}
              limit={review.timeout}
              label="sec"
              showProgress={false}
            />
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Press ESC to cancel</Text>
          </Box>
        </Box>
      );
    }

    case 'review':
      return review.result ? <ReviewView result={review.result} /> : null;

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

    case 'fileSelect':
      return <FileSelectScreen />;

    case 'error': {
      const errorInfo = getUserFriendlyError(error || 'Unknown error');
      return (
        <Box padding={1} flexDirection="column">
          <StatusText variant="error" bold withIcon>
            {errorInfo.title}
          </StatusText>
          <Box marginTop={1}>
            <StatusText variant="error">{errorInfo.message}</StatusText>
          </Box>
          <Box marginTop={1}>
            <StatusText variant="info" withIcon>{errorInfo.suggestion}</StatusText>
          </Box>
          <Box marginTop={2}>
            <HintText>Press ESC or B to go back</HintText>
          </Box>
        </Box>
      );
    }

    default:
      return <MainMenu onSelect={onMenuSelect} />;
  }
}
