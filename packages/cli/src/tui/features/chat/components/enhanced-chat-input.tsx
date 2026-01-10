/**
 * Enhanced Chat Input Component
 *
 * Full-featured chat input with:
 * - Input history navigation (up/down arrows)
 * - Command palette on / key
 * - Loading state with spinner
 * - Token count display
 * - Keyboard hints
 */

import { useState, useCallback, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import {
  useTheme,
  TokenBadge,
  StarSpinner,
  HintText,
} from '../../../design-system/index.js';
import { STAR_ICONS } from '../../../design-system/palettes.js';
import { useInputHistory } from '../hooks/use-input-history.js';
import { CommandPalette } from './command-palette.js';
import { type Command } from '../commands/index.js';

export interface EnhancedChatInputProps {
  /** Called when user submits input */
  onSubmit: (input: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disable input (e.g., during loading) */
  disabled?: boolean;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Current token count for display */
  tokenCount?: number;
  /** Token limit for the model */
  tokenLimit?: number;
}

/**
 * Enhanced chat input with history, command palette, and loading states
 */
export function EnhancedChatInput({
  onSubmit,
  placeholder = 'Type a message... (/ for commands)',
  disabled = false,
  isLoading = false,
  tokenCount,
  tokenLimit,
}: EnhancedChatInputProps) {
  const { colors } = useTheme();
  const [value, setValue] = useState('');
  const {
    addEntry,
    navigateUp,
    navigateDown,
    resetNavigation,
    isBrowsingHistory,
  } = useInputHistory();

  // Detect if user is typing a command
  const commandSearchTerm = useMemo(() => {
    if (value.startsWith('/') && !value.includes(' ')) {
      return value.slice(1);
    }
    return null;
  }, [value]);

  const showCommandPalette = commandSearchTerm !== null && !isLoading && !disabled;

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled && !isLoading) {
      addEntry(trimmed);
      onSubmit(trimmed);
      setValue('');
    }
  }, [value, disabled, isLoading, onSubmit, addEntry]);

  const handleCommandSelect = useCallback((command: Command) => {
    // Set the command in the input (with trailing space for args)
    setValue(`/${command.name} `);
  }, []);

  const handlePaletteClose = useCallback(() => {
    // Remove the / if user closes palette
    if (value === '/') {
      setValue('');
    }
  }, [value]);

  useInput((input, key) => {
    if (disabled || isLoading) return;

    // Don't handle arrow keys when command palette is open
    if (showCommandPalette && (key.upArrow || key.downArrow || key.return || key.tab)) {
      return;
    }

    // Submit on Enter
    if (key.return) {
      handleSubmit();
      return;
    }

    // Navigate history with up/down arrows
    if (key.upArrow) {
      const prev = navigateUp(value);
      if (prev !== null) {
        setValue(prev);
      }
      return;
    }

    if (key.downArrow) {
      const next = navigateDown();
      if (next !== null) {
        setValue(next);
      }
      return;
    }

    // Backspace/Delete
    if (key.backspace || key.delete) {
      resetNavigation();
      setValue(prev => prev.slice(0, -1));
      return;
    }

    // Regular character input
    if (input && !key.ctrl && !key.meta) {
      resetNavigation();
      setValue(prev => prev + input);
    }
  });

  // Determine border color based on state
  const borderColor = isLoading
    ? colors.border.warning
    : showCommandPalette
      ? colors.border.focus
      : isBrowsingHistory
        ? colors.border.focus
        : colors.border.subtle;

  return (
    <Box flexDirection="column">
      {/* Command palette overlay */}
      {showCommandPalette && (
        <CommandPalette
          searchTerm={commandSearchTerm}
          onSelect={handleCommandSelect}
          onClose={handlePaletteClose}
          isActive={showCommandPalette}
        />
      )}

      {/* Input box */}
      <Box
        borderStyle="round"
        borderColor={borderColor}
        paddingX={1}
      >
        <Box flexDirection="row" justifyContent="space-between" width="100%">
          <Box flexGrow={1}>
            {isLoading ? (
              <Box gap={1}>
                <StarSpinner />
                <Text dimColor>Thinking...</Text>
              </Box>
            ) : (
              <Box>
                <Text color={colors.text.secondary}>{STAR_ICONS.outline} </Text>
                <Text color={value ? colors.text.primary : colors.text.muted}>
                  {value || placeholder}
                </Text>
                {!isLoading && <Text inverse> </Text>}
              </Box>
            )}
          </Box>

          {tokenCount !== undefined && tokenLimit !== undefined && (
            <Box marginLeft={2}>
              <TokenBadge current={tokenCount} limit={tokenLimit} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Hints */}
      <Box paddingX={1} marginTop={0}>
        <HintText>
          {showCommandPalette
            ? '↑↓ select • Enter execute • ESC cancel'
            : 'Enter send • ↑↓ history • / commands'}
        </HintText>
      </Box>
    </Box>
  );
}
