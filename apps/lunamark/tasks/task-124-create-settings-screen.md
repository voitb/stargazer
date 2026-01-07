---
id: task-124
title: Create settings screen
status: completed
priority: medium
labels:
  - cli
  - tui
  - ui
created: '2026-01-07'
order: 124
assignee: glm
---

## Description

Create a settings screen that allows users to view/update API key, clear stored data, and configure preferences.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/screens/settings-screen.tsx`
- [ ] Show current API key status (masked if set, "Not configured" if not)
- [ ] Option to update API key
- [ ] Option to clear API key
- [ ] Option to clear all sessions
- [ ] Back navigation to main menu

## Implementation

**File**: `packages/cli/src/tui/screens/settings-screen.tsx`

```typescript
import { Box, Text, useInput } from 'ink';
import { Select } from '@inkjs/ui';
import { useAppContext } from '../state/app-context.js';
import { clearApiKey, getApiKey, maskApiKey } from '../storage/api-key-store.js';
import { useState, useEffect } from 'react';

const settingsOptions = [
  { label: 'Update API Key', value: 'update-key' },
  { label: 'Clear API Key', value: 'clear-key' },
  { label: 'Clear All Sessions', value: 'clear-sessions' },
  { label: 'Back to Menu', value: 'back' },
];

export function SettingsScreen() {
  const { navigate } = useAppContext();
  const [keyStatus, setKeyStatus] = useState<string>('Checking...');

  useEffect(() => {
    getApiKey().then(key => {
      setKeyStatus(key ? `Set (${maskApiKey(key)})` : 'Not configured');
    });
  }, []);

  const handleSelect = async (value: string) => {
    switch (value) {
      case 'update-key':
        navigate('apiKeySetup');
        break;
      case 'clear-key':
        await clearApiKey();
        setKeyStatus('Not configured');
        break;
      case 'clear-sessions':
        // TODO: Implement session clearing
        break;
      case 'back':
        navigate('home');
        break;
    }
  };

  useInput((_, key) => {
    if (key.escape) navigate('home');
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Settings</Text>

      <Box marginTop={1}>
        <Text>API Key Status: </Text>
        <Text color={keyStatus.includes('Not') ? 'red' : 'green'}>{keyStatus}</Text>
      </Box>

      <Box marginTop={2}>
        <Select options={settingsOptions} onChange={handleSelect} />
      </Box>

      <Box marginTop={2}>
        <Text dimColor>Press ESC to go back</Text>
      </Box>
    </Box>
  );
}
```

**Also create screens index file:**

**File**: `packages/cli/src/tui/screens/index.ts`

```typescript
export { ApiKeySetupScreen } from './api-key-setup-screen.js';
export { SettingsScreen } from './settings-screen.js';
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
pnpm build
node dist/index.js
# Navigate to Settings from menu
```
