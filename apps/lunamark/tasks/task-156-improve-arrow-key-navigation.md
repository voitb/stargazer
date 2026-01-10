---
id: task-156
title: Improve arrow key navigation in TUI
status: done
priority: high
labels:
  - cli
  - feature
  - navigation
created: '2025-01-10'
order: 156
assignee: ai-agent
depends_on:
  - task-155
---

## Description

Improve keyboard navigation throughout the TUI with arrow keys for depth navigation (left/right to go in/back) and vim-style alternatives.

## Requirements

### Current Navigation
- Up/Down: Navigate menu items (works)
- Enter: Select item (works)
- ESC/B: Go back (works but sometimes broken - see task-155)

### New Navigation
- Left Arrow: Go back (same as ESC)
- Right Arrow: Go into selected item (same as Enter)
- H/J/K/L: Vim-style navigation
- Tab: Cycle through focusable elements

## Implementation

### Step 1: Update keyboard hook

**File:** `packages/cli/src/tui/hooks/use-app-keyboard.ts`

Add arrow key support:

```typescript
import { useInput } from 'ink';

interface UseAppKeyboardOptions {
  screen: Screen;
  apiKeyStatus?: boolean;
  onCancelReview?: () => void;
  onGoToMenu: () => void;
  onGoBack: () => void;
  onGoToProviderSelect: () => void;
}

export function useAppKeyboard({
  screen,
  apiKeyStatus,
  onCancelReview,
  onGoToMenu,
  onGoBack,
  onGoToProviderSelect,
}: UseAppKeyboardOptions) {
  useInput((input, key) => {
    // Global shortcuts
    if (input === 'q' || (key.ctrl && input === 'c')) {
      // Exit handled by Ink
      return;
    }

    // During loading, only allow cancel
    if (screen === 'loading') {
      if (key.escape) {
        onCancelReview?.();
      }
      return;
    }

    // Navigation shortcuts
    // Go back: ESC, B, Left Arrow, H (vim)
    if (key.escape || input === 'b' || key.leftArrow || input === 'h') {
      if (screen !== 'home') {
        onGoBack();
        return;
      }
    }

    // Provider setup shortcut
    if (screen === 'home' && !apiKeyStatus) {
      if (input === 's') {
        onGoToProviderSelect();
        return;
      }
    }
  });
}
```

### Step 2: Update main menu navigation

**File:** `packages/cli/src/tui/components/navigation/main-menu.tsx`

Add right arrow and vim support:

```typescript
import { Box, Text, useInput } from 'ink';
import { useState } from 'react';

interface MainMenuProps {
  onSelect: (value: string) => void;
}

const MENU_ITEMS = [
  { value: 'review-staged', label: 'Review Staged Changes' },
  { value: 'review-unstaged', label: 'Review Unstaged Changes' },
  { value: 'discover', label: 'Discover Codebase' },
  { value: 'continue', label: 'Continue Session' },
  { value: 'history', label: 'Session History' },
  { value: 'settings', label: 'Settings' },
  { value: 'help', label: 'Help' },
  { value: 'exit', label: 'Exit' },
];

export function MainMenu({ onSelect }: MainMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    // Up: Arrow Up, K (vim)
    if (key.upArrow || input === 'k') {
      setSelectedIndex(i => Math.max(0, i - 1));
      return;
    }

    // Down: Arrow Down, J (vim)
    if (key.downArrow || input === 'j') {
      setSelectedIndex(i => Math.min(MENU_ITEMS.length - 1, i + 1));
      return;
    }

    // Select: Enter, Right Arrow, L (vim)
    if (key.return || key.rightArrow || input === 'l') {
      const item = MENU_ITEMS[selectedIndex];
      if (item) {
        onSelect(item.value);
      }
      return;
    }

    // Quick select by number
    const num = parseInt(input, 10);
    if (num >= 1 && num <= MENU_ITEMS.length) {
      const item = MENU_ITEMS[num - 1];
      if (item) {
        onSelect(item.value);
      }
      return;
    }
  });

  return (
    <Box flexDirection="column" paddingY={1}>
      {MENU_ITEMS.map((item, index) => (
        <Box key={item.value} paddingLeft={2}>
          <Text color={index === selectedIndex ? 'cyan' : undefined}>
            {index === selectedIndex ? '▶ ' : '  '}
            {index + 1}. {item.label}
          </Text>
        </Box>
      ))}
      <Box marginTop={1} paddingLeft={2}>
        <Text dimColor>
          ↑↓/jk navigate • →/l/Enter select • ←/h/ESC back
        </Text>
      </Box>
    </Box>
  );
}
```

### Step 3: Update history screen navigation

**File:** `packages/cli/src/tui/features/sessions/history-screen.tsx`

Apply the same pattern to history navigation.

### Step 4: Update settings screen navigation

**File:** `packages/cli/src/tui/features/settings/settings-screen.tsx`

Apply the same pattern to settings navigation.

### Step 5: Create navigation constants

**File:** `packages/cli/src/tui/config/keymaps.ts` (create)

```typescript
/**
 * Default keymap configuration
 */
export const KEYMAPS = {
  // Navigation
  up: ['↑', 'k'],
  down: ['↓', 'j'],
  left: ['←', 'h'],
  right: ['→', 'l'],
  back: ['ESC', 'b', '←', 'h'],
  select: ['Enter', '→', 'l'],

  // Actions
  cancel: ['ESC'],
  confirm: ['Enter', 'y'],
  delete: ['d', 'Delete'],
  search: ['/', 's'],
  help: ['?', 'h'],
  quit: ['q', 'Ctrl+C'],
} as const;

/**
 * Get keymap hint string for display
 */
export function getKeymapHint(action: keyof typeof KEYMAPS): string {
  return KEYMAPS[action].join('/');
}
```

## Acceptance Criteria

- [ ] Left arrow goes back (same as ESC)
- [ ] Right arrow selects item (same as Enter)
- [ ] H/J/K/L work as vim alternatives
- [ ] Number keys (1-9) quick select menu items
- [ ] Consistent navigation across all screens
- [ ] Updated key hints in UI

## Test

```bash
# Manual test:
# 1. Start CLI
# 2. Use arrow keys to navigate menu
# 3. Press Right Arrow to select
# 4. Press Left Arrow to go back
# 5. Use J/K to navigate
# 6. Use L to select
# 7. Use H to go back
# 8. Press number keys to quick select
```

## Files Changed

- `packages/cli/src/tui/hooks/use-app-keyboard.ts`
- `packages/cli/src/tui/components/navigation/main-menu.tsx`
- `packages/cli/src/tui/features/sessions/history-screen.tsx`
- `packages/cli/src/tui/features/settings/settings-screen.tsx`
- CREATE: `packages/cli/src/tui/config/keymaps.ts`
