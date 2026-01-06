import { Box, Text } from 'ink';

export function WelcomeMessage() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="green">
        Welcome to Stargazer!
      </Text>
      <Box marginTop={1}>
        <Text>
          AI-powered code review with convention learning.
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          TUI is loading... Full menu coming in next update.
        </Text>
      </Box>
    </Box>
  );
}
