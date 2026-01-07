import { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { TextInput } from '@inkjs/ui';
import { saveApiKey } from '../storage/api-key-store.js';
import { useAppContext } from '../state/app-context.js';

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
      <Text bold color="cyan">Gemini API Key Setup</Text>

      <Box marginTop={1} flexDirection="column">
        <Text>Enter your Gemini API key to enable AI code review.</Text>
        <Text dimColor>Get your key at: https://aistudio.google.com/apikey</Text>
      </Box>

      <Box marginTop={2} flexDirection="column">
        <Text>API Key:</Text>
        <Box>
          <Text color="cyan">&gt; </Text>
          <TextInput
            key={key}
            onSubmit={handleSubmit}
            placeholder="Enter your API key..."
          />
        </Box>
      </Box>

      <Box marginTop={2}>
        <Text dimColor>Press Enter to save | ESC to cancel</Text>
        {isSaving && <Text color="yellow"> Saving...</Text>}
      </Box>
    </Box>
  );
}
