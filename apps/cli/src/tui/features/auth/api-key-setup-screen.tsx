import { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { saveApiKey } from '../../storage/api-key-store.js';
import { useAppContext } from '../../state/app-context.js';
import { Divider } from '../../components/display/divider.js';
import { HintText } from '../../components/display/labels.js';
import { ScreenTitle } from '../../components/display/titles.js';
import { InputField } from '../../components/forms/input-field.js';
import { StatusText } from '../../components/feedback/status-text.js';

export function ApiKeySetupScreen() {
  const { navigate, setError } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [value, setValue] = useState('');

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

      <Box marginY={1}>
        <Divider variant="star" width={40} />
      </Box>

      <InputField
        label="API Key"
        value={value}
        onChange={setValue}
        onSubmit={(input) => {
          handleSubmit(input);
          setValue('');
        }}
        placeholder="Enter your API key..."
      />

      <Box marginTop={2}>
        <HintText>Press Enter to save | ESC to cancel</HintText>
        {isSaving && <StatusText variant="warning"> Saving...</StatusText>}
      </Box>
    </Box>
  );
}
