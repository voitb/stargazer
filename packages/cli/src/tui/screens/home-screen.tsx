import { useEffect } from 'react';
import { Box } from 'ink';
import { MainMenu } from '../components/index.js';
import { useAppContext } from '../state/app-context.js';

interface HomeScreenProps {
  onSelect: (value: string) => void;
}

export function HomeScreen({ onSelect }: HomeScreenProps) {
  const { refreshSessions } = useAppContext();

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <MainMenu onSelect={onSelect} />
    </Box>
  );
}
