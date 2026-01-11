/**
 * Command Palette Component
 *
 * Displays available commands as user types /
 * Allows navigation and selection with keyboard.
 */

import { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../../../theme/index.js';
import { HintText } from '../../../components/display/labels.js';
import { getAllCommands, getCommandSuggestions, type Command } from '../commands/index.js';

export interface CommandPaletteProps {
  /** Current search term (text after /) */
  searchTerm: string;
  /** Called when command is selected */
  onSelect: (command: Command) => void;
  /** Called when palette should close */
  onClose: () => void;
  /** Whether palette is active/focused */
  isActive?: boolean;
}

/**
 * Command palette with fuzzy search and keyboard navigation
 */
export function CommandPalette({
  searchTerm,
  onSelect,
  onClose,
  isActive = true,
}: CommandPaletteProps) {
  const { colors } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const suggestions = useMemo(() => {
    if (!searchTerm) return getAllCommands();
    return getCommandSuggestions(searchTerm);
  }, [searchTerm]);

  useInput((input, key) => {
    if (!isActive) return;

    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex(i => Math.max(0, i - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex(i => Math.min(suggestions.length - 1, i + 1));
      return;
    }

    if (key.return && suggestions[selectedIndex]) {
      onSelect(suggestions[selectedIndex]);
      return;
    }

    if (key.tab && suggestions[selectedIndex]) {
      onSelect(suggestions[selectedIndex]);
      return;
    }
  }, { isActive });

  // Reset selection when suggestions change
  useMemo(() => {
    setSelectedIndex(0);
  }, [suggestions.length]);

  if (suggestions.length === 0) {
    return (
      <Box
        borderStyle="round"
        borderColor={colors.border.subtle}
        paddingX={1}
        marginBottom={1}
      >
        <Text dimColor>No commands match "{searchTerm}"</Text>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.border.focus}
      marginBottom={1}
    >
      <Box paddingX={1} paddingTop={0}>
        <Text bold color={colors.text.secondary}>Commands</Text>
      </Box>

      <Box flexDirection="column" paddingX={1}>
        {suggestions.slice(0, 8).map((cmd, index) => {
          const isSelected = index === selectedIndex;
          return (
            <Box key={cmd.name} gap={1}>
              <Text color={isSelected ? colors.brand.primary : undefined}>
                {isSelected ? '▸' : ' '}
              </Text>
              <Text bold={isSelected} color={isSelected ? colors.brand.primary : undefined}>
                /{cmd.name}
              </Text>
              <Text dimColor>{cmd.description}</Text>
            </Box>
          );
        })}
      </Box>

      <Box paddingX={1} paddingBottom={0}>
        <HintText>↑↓ navigate • Enter/Tab select • ESC close</HintText>
      </Box>
    </Box>
  );
}
