import { useState, useEffect } from 'react';
import { Box, useInput } from 'ink';
import { Select } from '@inkjs/ui';
import { useAppContext } from '../../state/app-context.js';
import { saveSelectedModel, getDefaultModel, getProvider } from '../../storage/api-key-store.js';
import { getModelsForProvider, type Provider } from '../../config/models.js';
import { HintText, LabelText } from '../../components/display/labels.js';
import { ScreenTitle } from '../../components/display/titles.js';

export function ModelSelectScreen() {
  const { navigate } = useAppContext();
  const [provider, setProvider] = useState<Provider>('gemini');

  // Load saved provider on mount
  useEffect(() => {
    getProvider().then((p) => setProvider((p as Provider) || 'gemini'));
  }, []);

  const models = getModelsForProvider(provider);
  const defaultModel = getDefaultModel(provider);

  const handleSelect = async (value: string) => {
    await saveSelectedModel(value);
    navigate('home');
  };

  const handleSkip = async () => {
    await saveSelectedModel(defaultModel);
    navigate('home');
  };

  useInput((input, key) => {
    if (key.escape) {
      handleSkip();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <ScreenTitle>Select AI Model</ScreenTitle>
      <LabelText>
        Provider: {provider === 'gemini' ? 'Google Gemini' : 'ZhipuAI GLM'}
      </LabelText>
      <HintText>Press ESC to use default ({defaultModel})</HintText>
      <Box marginTop={1}>
        <Select options={[...models]} onChange={handleSelect} />
      </Box>
    </Box>
  );
}
