import { Box, useInput } from 'ink';
import { SessionList } from './components/session-list.js';
import { useAppContext } from '../../state/app-context.js';
import { ScreenTitle } from '../../design-system/index.js';

export function HistoryScreen() {
  const { sessions, resumeSession, navigate } = useAppContext();

  const handleSelect = async (sessionId: string) => {
    await resumeSession(sessionId);
  };

  const handleBack = () => {
    navigate('home');
  };

  useInput((_, key) => {
    if (key.escape) navigate('home');
  });

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
