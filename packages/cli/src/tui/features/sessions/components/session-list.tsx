import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { formatDistanceToNow } from 'date-fns';
import type { SessionIndexEntry } from '../../../storage/types.js';
import { SelectWithArrows } from '../../../design-system/index.js';

interface SessionListProps {
  sessions: readonly SessionIndexEntry[];
  onSelect: (sessionId: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function SessionList({ sessions, onSelect, onBack, isLoading = false }: SessionListProps) {
  if (isLoading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Spinner label="Loading sessions..." />
      </Box>
    );
  }

  if (sessions.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text dimColor>No previous sessions found.</Text>
        <Box marginTop={1}>
          <Text dimColor>←/ESC to go back</Text>
        </Box>
      </Box>
    );
  }

  const options = [
    ...sessions.map((session) => ({
      label: `${session.projectName} - ${formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })} (${session.messageCount} messages)`,
      value: session.id,
    })),
    { label: '← Back to menu', value: '__back__' },
  ];

  const handleSelect = (value: string) => {
    if (value === '__back__') {
      onBack();
    } else {
      onSelect(value);
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Previous Sessions</Text>
      <Box marginTop={1}>
        <SelectWithArrows options={options} onSelect={handleSelect} />
      </Box>
      <Box marginTop={1}>
        <Text dimColor>↑↓ navigate • →/Enter select • ←/ESC back</Text>
      </Box>
    </Box>
  );
}
