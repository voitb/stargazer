import { Box, Text } from 'ink';
import { gradientLine, useTheme } from '../../theme/index.js';
import { Divider, MENU_ICONS, SelectWithArrows } from '../index.js';

interface MenuOption {
  label: string;
  value: string;
}

/**
 * Menu options with star-themed icons
 */
const menuOptions: MenuOption[] = [
  { label: `${MENU_ICONS.review} Review staged changes`, value: 'review-staged' },
  { label: `${MENU_ICONS.review} Review unstaged changes`, value: 'review-unstaged' },
  { label: `${MENU_ICONS.review} Review specific files`, value: 'review-files' },
  { label: `${MENU_ICONS.discover} Discover conventions`, value: 'discover' },
  { label: `${MENU_ICONS.continue} Continue previous session`, value: 'continue' },
  { label: `${MENU_ICONS.history} Browse history`, value: 'history' },
  { label: `${MENU_ICONS.settings} Settings`, value: 'settings' },
  { label: `${MENU_ICONS.help} Help`, value: 'help' },
  { label: `${MENU_ICONS.exit} Exit`, value: 'exit' },
];

interface MainMenuProps {
  onSelect: (value: string) => void;
}

/**
 * Main menu with star-themed styling
 *
 * Features:
 * - Theme-aware gradient header text
 * - Star dividers
 * - Star/celestial icons (from design system)
 * - Clean, minimalist layout
 *
 * Following CLI_ARCHITECTURE.md navigation component guidelines.
 */
export function MainMenu({ onSelect }: MainMenuProps) {
  const { theme } = useTheme();
  // Use theme-aware palette: moonlight for dark, dusk for light
  const headerPalette = theme === 'dark' ? 'moonlight' : 'dusk';
  const headerText = gradientLine('What would you like to do?', {
    palette: headerPalette,
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text>{headerText}</Text>
      <Box marginY={1}>
        <Divider variant="dots" dimmed />
      </Box>
      <SelectWithArrows options={menuOptions} onSelect={onSelect} />
      <Box marginTop={1}>
        <Text dimColor>↑↓/jk navigate • →/Enter/l select • ←/ESC/h back • 1-9 quick • Q quit</Text>
      </Box>
    </Box>
  );
}

/**
 * Compact menu for constrained displays
 */
export function CompactMenu({ onSelect }: MainMenuProps) {
  const compactOptions: MenuOption[] = [
    { label: '✦ Review', value: 'review-staged' },
    { label: '✧ Discover', value: 'discover' },
    { label: '◇ History', value: 'history' },
    { label: '◈ Settings', value: 'settings' },
    { label: '◌ Exit', value: 'exit' },
  ];

  return (
    <Box flexDirection="column" paddingX={1}>
      <SelectWithArrows options={compactOptions} onSelect={onSelect} />
    </Box>
  );
}
