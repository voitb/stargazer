import { Box, Text } from 'ink';
import { Select } from '@inkjs/ui';
import { useAppContext } from '../state/app-context.js';
import { saveProvider, type Provider } from '../storage/api-key-store.js';

const providerOptions = [
  { label: '🔮 Google Gemini (Recommended)', value: 'gemini' },
  { label: '🤖 GLM-4 (ZhipuAI)', value: 'glm' },
];

export function ProviderSelectScreen() {
  const { navigate, setError } = useAppContext();

  const handleSelect = async (value: string) => {
    // Save the selected provider to config
    const result = await saveProvider(value as Provider);
    if (!result.ok) {
      setError(`Failed to save provider: ${result.error.message}`);
      return;
    }
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
