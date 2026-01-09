import { Box, Text, useInput } from 'ink';
import { Select, ConfirmInput } from '@inkjs/ui';
import { useAppContext } from '../state/app-context.js';
import { useSettings } from '../hooks/use-settings.js';
import { TIMEOUT_OPTIONS } from '../constants/settings.js';

// Convert timeout options to Select format (string values)
const timeoutSelectOptions = [
  ...TIMEOUT_OPTIONS.map((opt) => ({
    label: opt.label,
    value: String(opt.value),
  })),
  { label: '← Cancel', value: 'cancel' },
];

export function SettingsScreen() {
  const { navigate } = useAppContext();
  const {
    keyStatus,
    timeoutValue,
    providerDisplayName,
    modelDisplayName,
    modal,
    showTimeoutModal,
    showConfirmClearModal,
    closeModal,
    handleTimeoutSelect,
    handleConfirmClear,
  } = useSettings();

  // Build dynamic settings options based on current state
  const settingsOptions = [
    { label: `🔮 Provider: ${providerDisplayName}`, value: 'change-provider' },
    { label: `🤖 Model: ${modelDisplayName}`, value: 'change-model' },
    { label: '🔑 Update API Key', value: 'update-key' },
    { label: `⏱️  Timeout: ${timeoutValue / 1000}s`, value: 'change-timeout' },
    { label: '🗑️  Clear API Key & Provider', value: 'clear-key' },
    { label: '📂 Clear All Sessions', value: 'clear-sessions' },
    { label: '← Back to Menu', value: 'back' },
  ];

  const handleSelect = (value: string) => {
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
        showTimeoutModal();
        break;
      case 'clear-key':
        showConfirmClearModal();
        break;
      case 'clear-sessions':
        // TODO: Implement session clearing
        break;
      case 'back':
        navigate('home');
        break;
    }
  };

  const handleClearConfirmed = async () => {
    const { success } = await handleConfirmClear();
    if (success) {
      navigate('providerSelect');
    }
  };

  useInput((_, key) => {
    if (key.escape) {
      if (modal !== 'none') {
        closeModal();
      } else {
        navigate('home');
      }
    }
  });

  // Timeout selection modal
  if (modal === 'timeout') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          ⏱️ Select Timeout
        </Text>
        <Box marginTop={1}>
          <Text dimColor>Current: {timeoutValue / 1000} seconds</Text>
        </Box>
        <Box marginTop={2}>
          <Select options={timeoutSelectOptions} onChange={handleTimeoutSelect} />
        </Box>
        <Box marginTop={2}>
          <Text dimColor>Press ESC to cancel</Text>
        </Box>
      </Box>
    );
  }

  // Clear confirmation modal
  if (modal === 'confirm-clear') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="yellow">
          Clear API Key?
        </Text>
        <Box marginTop={1}>
          <Text>This will remove your API key and you'll need to set it up again.</Text>
        </Box>
        <Box marginTop={2}>
          <Text>Are you sure? </Text>
          <ConfirmInput onConfirm={handleClearConfirmed} onCancel={closeModal} />
        </Box>
      </Box>
    );
  }

  // Main settings screen
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        Settings
      </Text>

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
