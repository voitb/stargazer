import { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { TextInput } from '@inkjs/ui';
import { saveApiKey } from '../../storage/api-key-store.js';
import { useAppContext } from '../../state/app-context.js';
import { ScreenTitle, StatusText, HintText, MENU_ICONS, statusColors } from '../../design-system/index.js';

export function ApiKeySetupScreen() {
  const { navigate, setError } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [key, setKey] = useState(0);

  const handleSubmit = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setIsSaving(true);
    const result = await saveApiKey(trimmed);

    if (result.ok) {
      navigate('modelSelect'); // Navigate to model selection after API key setup
    } else {
      setError(result.error.message);
      navigate('error');
    }
    setIsSaving(false);
  }, [navigate, setError]);

  useInput((_, keyPressed) => {
    if (keyPressed.escape) {
      navigate('providerSelect');
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <ScreenTitle>API Key Setup</ScreenTitle>

      <Box marginTop={1} flexDirection="column">
        <Text>Enter your API key to enable AI code review.</Text>
        <HintText>Get your key at: https://aistudio.google.com/apikey</HintText>
      </Box>

      <Box marginTop={2} flexDirection="column">
        <Text>API Key:</Text>
        <Box>
          <Text color={statusColors.info.text}>{MENU_ICONS.discover} </Text>
          <TextInput
            key={key}
            onSubmit={handleSubmit}
            placeholder="Enter your API key..."
          />
        </Box>
      </Box>

      <Box marginTop={2}>
        <HintText>Press Enter to save | ESC to cancel</HintText>
        {isSaving && <StatusText variant="warning"> Saving...</StatusText>}
      </Box>
    </Box>
  );
}
