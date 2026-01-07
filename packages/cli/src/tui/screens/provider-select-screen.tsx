import { Box, Text } from 'ink';
import { Select } from '@inkjs/ui';
import { useAppContext } from '../state/app-context.js';

const providerOptions = [
  { label: '🔮 Google Gemini (Recommended)', value: 'gemini' },
  { label: '🤖 GLM-4 (ZhipuAI)', value: 'glm' },
];

export function ProviderSelectScreen() {
  const { navigate } = useAppContext();

  const handleSelect = (_value: string) => {
    navigate('apiKeySetup');
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Welcome to Stargazer</Text>

      <Box marginTop={1} flexDirection="column">
        <Text>Select your AI provider to get started:</Text>
      </Box>

      <Box marginTop={2}>
        <Select options={providerOptions} onChange={handleSelect} />
      </Box>

      <Box marginTop={2} flexDirection="column">
        <Text dimColor>Use arrow keys to navigate, Enter to select</Text>
      </Box>
    </Box>
  );
}
