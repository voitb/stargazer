import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Select, ConfirmInput } from '@inkjs/ui';
import { useAppContext } from '../state/app-context.js';
import {
  getApiKey,
  clearApiKey,
  maskApiKey,
  getTimeout,
  saveTimeout,
  getProvider,
  getSelectedModel,
  type Provider,
} from '../storage/api-key-store.js';

const timeoutOptions = [
  { label: '30 seconds', value: '30000' },
  { label: '60 seconds (default)', value: '60000' },
  { label: '120 seconds', value: '120000' },
  { label: '180 seconds', value: '180000' },
  { label: '← Cancel', value: 'cancel' },
];

function getProviderDisplayName(provider: Provider | undefined): string {
  if (!provider) return 'Not configured';
  return provider === 'gemini' ? 'Google Gemini' : 'ZhipuAI GLM';
}

function formatModelName(model: string | undefined): string {
  if (!model) return 'Not selected';
  // Shorten long model names for display
  if (model.length > 30) {
    return model.slice(0, 27) + '...';
  }
  return model;
}

export function SettingsScreen() {
  const { navigate } = useAppContext();
  const [keyStatus, setKeyStatus] = useState<string>('Checking...');
  const [timeoutValue, setTimeoutValue] = useState<number>(60000);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showTimeoutSelect, setShowTimeoutSelect] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<Provider | undefined>(undefined);
  const [currentModel, setCurrentModel] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Load all settings
    Promise.all([
      getApiKey(),
      getTimeout(),
      getProvider(),
      getSelectedModel(),
    ]).then(([key, timeout, provider, model]) => {
      setKeyStatus(key ? `Configured (${maskApiKey(key)})` : 'Not configured');
      setTimeoutValue(timeout);
      setCurrentProvider(provider);
      setCurrentModel(model);
    }).catch(() => setKeyStatus('Error loading settings'));
  }, []);

  // Build dynamic settings options based on current state
  const settingsOptions = [
    { label: `🔮 Provider: ${getProviderDisplayName(currentProvider)}`, value: 'change-provider' },
    { label: `🤖 Model: ${formatModelName(currentModel)}`, value: 'change-model' },
    { label: '🔑 Update API Key', value: 'update-key' },
    { label: `⏱️  Timeout: ${timeoutValue / 1000}s`, value: 'change-timeout' },
    { label: '🗑️  Clear API Key & Provider', value: 'clear-key' },
    { label: '📂 Clear All Sessions', value: 'clear-sessions' },
    { label: '← Back to Menu', value: 'back' },
  ];

  const handleSelect = async (value: string) => {
    switch (value) {
      case 'change-provider':
        navigate('providerSelect');
        break;
      case 'change-model':
        navigate('modelSelect');
        break;
      case 'update-key':
        navigate('apiKeySetup');
        break;
      case 'change-timeout':
        setShowTimeoutSelect(true);
        break;
      case 'clear-key':
        setConfirmClear(true);
        break;
      case 'clear-sessions':
        break;
      case 'back':
        navigate('home');
        break;
    }
  };

  const handleTimeoutSelect = async (value: string) => {
    if (value === 'cancel') {
      setShowTimeoutSelect(false);
      return;
    }
    const timeout = parseInt(value, 10);
    await saveTimeout(timeout);
    setTimeoutValue(timeout);
    setShowTimeoutSelect(false);
  };

  const handleConfirmClear = async () => {
    const result = await clearApiKey();
    if (result.ok) {
      navigate('providerSelect');
    } else {
      setKeyStatus('Error clearing key');
    }
  };

  const handleCancelClear = () => {
    setConfirmClear(false);
  };

  useInput((_, key) => {
    if (key.escape) {
      if (confirmClear) {
        setConfirmClear(false);
      } else if (showTimeoutSelect) {
        setShowTimeoutSelect(false);
      } else {
        navigate('home');
      }
    }
  });

  if (showTimeoutSelect) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">⏱️ Select Timeout</Text>
        <Box marginTop={1}>
          <Text dimColor>Current: {timeoutValue / 1000} seconds</Text>
        </Box>
        <Box marginTop={2}>
          <Select options={timeoutOptions} onChange={handleTimeoutSelect} />
        </Box>
        <Box marginTop={2}>
          <Text dimColor>Press ESC to cancel</Text>
        </Box>
      </Box>
    );
  }

  if (confirmClear) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="yellow">Clear API Key?</Text>
        <Box marginTop={1}>
          <Text>This will remove your API key and you'll need to set it up again.</Text>
        </Box>
        <Box marginTop={2}>
          <Text>Are you sure? </Text>
          <ConfirmInput onConfirm={handleConfirmClear} onCancel={handleCancelClear} />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Settings</Text>

      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text>API Key: </Text>
          <Text color={keyStatus.includes('Not') ? 'red' : 'green'}>{keyStatus}</Text>
        </Box>
      </Box>

      <Box marginTop={2}>
        <Select options={settingsOptions} onChange={handleSelect} />
      </Box>

      <Box marginTop={2}>
        <Text dimColor>Press ESC to go back</Text>
      </Box>
    </Box>
  );
}
