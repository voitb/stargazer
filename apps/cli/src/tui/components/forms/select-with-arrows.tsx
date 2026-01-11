/**
 * Stargazer CLI Design System - Select With Arrows Component
 *
 * Custom select component that supports arrow key navigation:
 * - ↑↓ to navigate options (standard)
 * - → or Enter to select
 * - Themed styling with star icons
 */

import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { STAR_ICONS } from '../../theme/palettes.js';
import { useTheme } from '../../theme/index.js';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectWithArrowsProps {
  /** Options to display */
  options: SelectOption[];
  /** Callback when an option is selected */
  onSelect: (value: string) => void;
  /** Initial highlighted index */
  defaultIndex?: number;
  /** Whether the select is disabled (prevents selection) */
  isDisabled?: boolean;
  /** External focus control - when false, component doesn't capture keyboard input */
  isActive?: boolean;
}

/**
 * Select component with arrow key navigation
 *
 * Supports:
 * - ↑↓ for navigation
 * - → or Enter for selection
 */
export function SelectWithArrows({
  options,
  onSelect,
  defaultIndex = 0,
  isDisabled = false,
}: SelectWithArrowsProps) {
  const { colors } = useTheme();
  const [highlightedIndex, setHighlightedIndex] = useState(defaultIndex);

  useInput(
    (input, key) => {
      if (isDisabled) return;

      // Navigation: ↑ or k
      if (key.upArrow) {
        setHighlightedIndex((i) => Math.max(0, i - 1));
        return;
      }

      // Navigation: ↓ or j
      if (key.downArrow) {
        setHighlightedIndex((i) => Math.min(options.length - 1, i + 1));
        return;
      }

      // Selection: Enter or → (right arrow)
      if (key.return || key.rightArrow) {
        const option = options[highlightedIndex];
        if (option) {
          onSelect(option.value);
        }
        return;
      }
    },
    { isActive: !isDisabled }
  );

  return (
    <Box flexDirection="column">
      {options.map((option, index) => {
        const isHighlighted = index === highlightedIndex;
        const indicator = isHighlighted ? `${STAR_ICONS.filled} ` : '  ';

        return (
          <Box key={option.value}>
            <Text color={isHighlighted ? colors.border.focus : undefined}>
              {indicator}
              {option.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
