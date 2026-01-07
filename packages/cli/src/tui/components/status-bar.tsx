import { Box, Text } from 'ink';

interface StatusBarProps {
  message: string;
  sessionCount?: number;
  hasApiKey?: boolean;
}

export function StatusBar({ message, sessionCount, hasApiKey }: StatusBarProps) {
  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      paddingX={1}
      borderStyle="single"
      borderTop
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
    >
      <Text dimColor>{message}</Text>
      <Box>
        {hasApiKey !== undefined && (
          <Text color={hasApiKey ? 'green' : 'red'}>
            {hasApiKey ? 'API: OK' : 'API: Missing'}
          </Text>
        )}
        {sessionCount !== undefined && (
          <Text dimColor> | Sessions: {sessionCount}</Text>
        )}
      </Box>
    </Box>
  );
}
