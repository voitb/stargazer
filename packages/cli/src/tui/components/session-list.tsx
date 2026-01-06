import { Box, Text } from 'ink';
import { Select } from '@inkjs/ui';
import { formatDistanceToNow } from 'date-fns';

interface SessionEntry {
  id: string;
  projectName: string;
  updatedAt: string;
  messageCount: number;
}

interface SessionListProps {
  sessions: readonly SessionEntry[];
  onSelect: (sessionId: string) => void;
  onBack: () => void;
}

export function SessionList({ sessions, onSelect, onBack }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text dimColor>No previous sessions found.</Text>
        <Box marginTop={1}>
          <Text dimColor>Press ESC to go back</Text>
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
        <Select options={options} onChange={handleSelect} />
      </Box>
    </Box>
  );
}
