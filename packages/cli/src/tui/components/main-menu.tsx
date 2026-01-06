import { Box, Text } from 'ink';
import { Select } from '@inkjs/ui';

interface MenuOption {
  label: string;
  value: string;
}

const menuOptions: MenuOption[] = [
  { label: '🔍 Review staged changes', value: 'review-staged' },
  { label: '📝 Review unstaged changes', value: 'review-unstaged' },
  { label: '📚 Discover conventions', value: 'discover' },
  { label: '💬 Continue previous session', value: 'continue' },
  { label: '📂 Browse history', value: 'history' },
  { label: '❓ Help', value: 'help' },
  { label: '🚪 Exit', value: 'exit' },
];

interface MainMenuProps {
  onSelect: (value: string) => void;
}

export function MainMenu({ onSelect }: MainMenuProps) {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>What would you like to do?</Text>
      <Box marginTop={1}>
        <Select options={menuOptions} onChange={onSelect} />
      </Box>
    </Box>
  );
}
