import { Box, Text } from 'ink';
import { Select } from '@inkjs/ui';
import { useAppContext } from '../../state/app-context.js';
import { saveProvider, type Provider } from '../../storage/api-key-store.js';
import { ScreenTitle, HintText, MENU_ICONS } from '../../design-system/index.js';

const providerOptions = [
  { label: `${MENU_ICONS.provider} Google Gemini (Recommended)`, value: 'gemini' },
  { label: `${MENU_ICONS.model} GLM-4 (ZhipuAI)`, value: 'glm' },
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
      <ScreenTitle>Welcome to Stargazer</ScreenTitle>

      <Box marginTop={1} flexDirection="column">
        <Text>Select your AI provider to get started:</Text>
      </Box>

      <Box marginTop={2}>
        <Select options={providerOptions} onChange={handleSelect} />
      </Box>

      <Box marginTop={2} flexDirection="column">
        <HintText>Use arrow keys to navigate, Enter to select</HintText>
      </Box>
    </Box>
  );
}
