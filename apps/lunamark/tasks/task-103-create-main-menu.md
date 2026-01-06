---
id: task-103
title: Create MainMenu component
status: completed
priority: high
labels:
  - cli
  - tui
  - components
created: '2025-01-06'
order: 103
assignee: glm
---

## Description

Create the MainMenu component with options for reviewing code, browsing history, settings, and help.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/components/MainMenu.tsx`
- [ ] Display menu options using @inkjs/ui Select
- [ ] Options: Review staged, Review unstaged, Discover conventions, Continue session, Browse history, Settings, Help, Exit
- [ ] Handle selection with navigation and session creation

## Implementation

**File**: `packages/cli/src/tui/components/MainMenu.tsx`

```typescript
import React from 'react';
import { Box, Text } from 'ink';
import { Select } from '@inkjs/ui';
import { useApp } from '../state/app-context.js';

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
  { label: '⚙️  Settings', value: 'settings' },
  { label: '❓ Help', value: 'help' },
  { label: '🚪 Exit', value: 'exit' },
];

export function MainMenu() {
  const { navigate, startNewSession, sessions, resumeSession } = useApp();

  const handleSelect = async (value: string) => {
    switch (value) {
      case 'review-staged':
      case 'review-unstaged':
        await startNewSession();
        break;
      case 'continue':
        if (sessions.length > 0) {
          await resumeSession(sessions[0].id);
        } else {
          await startNewSession();
        }
        break;
      case 'history':
        navigate('history');
        break;
      case 'settings':
        navigate('settings');
        break;
      case 'help':
        navigate('help');
        break;
      case 'exit':
        process.exit(0);
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold marginBottom={1}>
        What would you like to do?
      </Text>
      <Select
        options={menuOptions}
        onChange={handleSelect}
      />
    </Box>
  );
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
