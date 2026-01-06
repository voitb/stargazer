import { Box, Text } from 'ink';

interface StatusBarProps {
  message?: string;
}

export function StatusBar({ message = 'Press Ctrl+C to exit' }: StatusBarProps) {
  return (
    <Box
      flexDirection="row"
      justifyContent="center"
      paddingX={1}
      borderStyle="single"
      borderTop
    >
      <Text dimColor>
        {message}
      </Text>
    </Box>
  );
}
