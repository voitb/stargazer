import { Box, Text, useInput } from 'ink';
import { Select, ConfirmInput } from '@inkjs/ui';
import { useAppContext } from '../../state/app-context.js';
import { useSettings } from './use-settings.js';
import { TIMEOUT_OPTIONS } from '../../config/settings.js';
import { MENU_ICONS } from '../../components/display/icons.js';
import { Divider } from '../../components/display/divider.js';
import { HintText } from '../../components/display/labels.js';
import { ScreenTitle, SectionTitle } from '../../components/display/titles.js';
import { StatusText } from '../../components/feedback/status-text.js';

// Convert timeout options to Select format (string values)
const timeoutSelectOptions = [
  ...TIMEOUT_OPTIONS.map((opt) => ({
    label: opt.label,
    value: String(opt.value),
  })),
  { label: `${MENU_ICONS.back} Cancel`, value: 'cancel' },
];

export function SettingsScreen() {
  const { navigate } = useAppContext();
  const {
    keyStatus,
    hasApiKey,
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

  // Build dynamic settings options based on current state (star-themed icons)
  const settingsOptions = [
    { label: `${MENU_ICONS.provider} Provider: ${providerDisplayName}`, value: 'change-provider' },
    { label: `${MENU_ICONS.model} Model: ${modelDisplayName}`, value: 'change-model' },
    { label: `${MENU_ICONS.apiKey} Update API Key`, value: 'update-key' },
    { label: `${MENU_ICONS.timeout} Timeout: ${timeoutValue / 1000}s`, value: 'change-timeout' },
    { label: `${MENU_ICONS.clear} Clear API Key & Provider`, value: 'clear-key' },
    { label: `${MENU_ICONS.sessions} Clear All Sessions`, value: 'clear-sessions' },
    { label: `${MENU_ICONS.back} Back to Menu`, value: 'back' },
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
        <ScreenTitle>Select Timeout</ScreenTitle>
        <Box marginTop={1}>
          <HintText>Current: {timeoutValue / 1000} seconds</HintText>
        </Box>
        <Box marginTop={2}>
          <Select options={timeoutSelectOptions} onChange={handleTimeoutSelect} />
        </Box>
        <Box marginTop={2}>
          <HintText>Press ESC to cancel</HintText>
        </Box>
      </Box>
    );
  }

  // Clear confirmation modal
  if (modal === 'confirm-clear') {
    return (
      <Box flexDirection="column" padding={1}>
        <StatusText variant="warning" bold withIcon>
          Clear API Key?
        </StatusText>
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
      <ScreenTitle>Settings</ScreenTitle>

      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text>API Key: </Text>
          <StatusText variant={hasApiKey ? 'success' : 'error'}>{keyStatus}</StatusText>
        </Box>
      </Box>

      <Box marginY={1}>
        <Divider variant="star" width={40} />
      </Box>
      <SectionTitle withStar>Options</SectionTitle>

      <Box marginTop={1}>
        <Select options={settingsOptions} onChange={handleSelect} />
      </Box>

      <Box marginTop={2}>
        <HintText>Press ESC to go back</HintText>
      </Box>
    </Box>
  );
}
