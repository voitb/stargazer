---
id: task-145
title: Create KeyHint component
status: pending
priority: high
labels:
  - cli
  - design-system
  - components
created: '2025-01-09'
order: 145
assignee: glm
depends_on:
  - task-134
---

## Description

Create a KeyHint component for displaying keyboard shortcuts.
Provides consistent styling for key combinations.

## Reference

See: `packages/cli/CLI_DESIGN_SYSTEM.md` - Component Library section

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/design-system/components/key-hint.tsx`
- [ ] Support single keys: [ESC], [Enter]
- [ ] Support key combinations: [⌘+K], [Ctrl+C]
- [ ] Support inline label after keys
- [ ] Dimmed styling for secondary hints

## Implementation

**File**: `packages/cli/src/tui/design-system/components/key-hint.tsx`

```typescript
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
 * Single key with label
 */
export interface SingleKeyHintProps {
  keyName: string;
  children?: ReactNode;
  dimmed?: boolean;
}

export function SingleKeyHint({ keyName, children, dimmed }: SingleKeyHintProps) {
  return <KeyHint keys={[keyName]} dimmed={dimmed}>{children}</KeyHint>;
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
  // ... etc

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
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```

## Usage Example

```typescript
import { Box, Text } from 'ink';
import { KeyHint, KeyHintBar, FormattedKeyHint } from '../design-system/components/key-hint.js';

function StatusBar() {
  return (
    <Box paddingX={1} borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false}>
      <KeyHintBar
        hints={[
          { keys: ['↑', '↓'], label: 'Navigate' },
          { keys: ['Enter'], label: 'Select' },
          { keys: ['ESC'], label: 'Back' },
          { keys: ['Q'], label: 'Quit' },
        ]}
      />
    </Box>
  );
}

function ActionHints() {
  return (
    <Box gap={2}>
      <FormattedKeyHint keys={['cmd', 'k']}>Search</FormattedKeyHint>
      <FormattedKeyHint keys={['esc']}>Cancel</FormattedKeyHint>
    </Box>
  );
}
```
