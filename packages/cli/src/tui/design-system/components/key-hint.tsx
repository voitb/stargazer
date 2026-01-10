/**
 * Stargazer CLI Design System - KeyHint Component
 *
 * Displays keyboard shortcuts with consistent styling.
 *
 * @example
 * ```typescript
 * import { KeyHint, KeyHintBar } from './key-hint.js';
 *
 * <KeyHint keys={['ESC']}>Go back</KeyHint>
 * <KeyHint keys={['⌘', 'K']}>Command palette</KeyHint>
 * ```
 */

import { Box, Text } from 'ink';
import { type ReactNode } from 'react';

export interface KeyHintProps {
  /** Key or key combination */
  keys: string[];
  /** Optional label after keys */
  children?: ReactNode;
  /** Dim the entire hint */
  dimmed?: boolean;
  /** Separator between keys (default: +) */
  separator?: string;
}

/**
 * KeyHint Component
 *
 * Displays a keyboard shortcut with optional label.
 */
export function KeyHint({
  keys,
  children,
  dimmed = false,
  separator = '+',
}: KeyHintProps) {
  const keyString = keys.join(separator);

  return (
    <Text dimColor={dimmed}>
      <Text>[{keyString}]</Text>
      {children && <Text> {children}</Text>}
    </Text>
  );
}

/**
 * Key hint bar - horizontal list of hints
 */
export interface KeyHintBarProps {
  hints: Array<{ keys: string[]; label: string }>;
  separator?: string;
  dimmed?: boolean;
}

export function KeyHintBar({
  hints,
  separator = '  │  ',
  dimmed = true,
}: KeyHintBarProps) {
  return (
    <Box flexDirection="row">
      {hints.map((hint, index) => (
        <Text key={index} dimColor={dimmed}>
          {index > 0 && separator}
          <Text>[{hint.keys.join('+')}]</Text>
          <Text> {hint.label}</Text>
        </Text>
      ))}
    </Box>
  );
}

/**
 * Common key names with proper symbols
 */
export const KEY_SYMBOLS = {
  // Modifiers
  cmd: '⌘',
  command: '⌘',
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: '⌥',
  shift: '⇧',
  meta: '⌘',

  // Navigation
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  enter: 'Enter',
  return: 'Return',
  space: 'Space',
  tab: 'Tab',
  esc: 'ESC',
  escape: 'ESC',
  backspace: '⌫',
  delete: 'Del',

  // Function keys
  f1: 'F1',
  f2: 'F2',
  f3: 'F3',

  // Special
  home: 'Home',
  end: 'End',
  pageup: 'PgUp',
  pagedown: 'PgDn',
} as const;

/**
 * Helper to format key name with proper symbol
 */
export function formatKey(key: string): string {
  const lower = key.toLowerCase();
  return KEY_SYMBOLS[lower as keyof typeof KEY_SYMBOLS] ?? key;
}

/**
 * KeyHint with auto-formatted keys
 */
export interface FormattedKeyHintProps {
  keys: string[];
  children?: ReactNode;
  dimmed?: boolean;
}

export function FormattedKeyHint({ keys, children, dimmed }: FormattedKeyHintProps) {
  const formattedKeys = keys.map(formatKey);
  return <KeyHint keys={formattedKeys} dimmed={dimmed}>{children}</KeyHint>;
}
