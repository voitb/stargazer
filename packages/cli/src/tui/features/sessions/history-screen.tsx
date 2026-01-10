import { useEffect } from 'react';
import { Box } from 'ink';
import { SessionList } from './components/session-list.js';
import { useAppContext } from '../../state/app-context.js';
import { ScreenTitle } from '../../design-system/index.js';

export function HistoryScreen() {
  const { sessions, resumeSession, navigate, refreshSessions } = useAppContext();

  // Load sessions when screen mounts (Task 154 fix)
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const handleSelect = async (sessionId: string) => {
    await resumeSession(sessionId);
  };

  const handleBack = () => {
    navigate('home');
  };

  // NOTE: Removed duplicate useInput handler - global handler in
  // use-app-keyboard.ts already handles ESC/B/← for 'history' screen

  return (
    <Box flexDirection="column" padding={1}>
      <ScreenTitle>Session History</ScreenTitle>
      <Box marginTop={1}>
        <SessionList
          sessions={sessions}
          onSelect={handleSelect}
          onBack={handleBack}
        />
      </Box>
    </Box>
  );
}
