---
id: task-122
title: Create API key setup screen component
status: completed
priority: high
labels:
  - cli
  - tui
  - ui
  - security
created: '2026-01-07'
order: 122
assignee: glm
---

## Description

Create an interactive TUI screen for setting up the Gemini API key, with masked input display (like Claude Code's `claude config set apiKey`).

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/screens/api-key-setup-screen.tsx`
- [ ] Display welcome message explaining API key requirement
- [ ] Show masked input field for API key entry
- [ ] Validate key format (starts with correct prefix)
- [ ] On save: store key and navigate to main menu
- [ ] Show "Get API key" link to Google AI Studio
- [ ] Handle cancel (ESC) to go back

## Implementation

**File**: `packages/cli/src/tui/screens/api-key-setup-screen.tsx`

```typescript
import { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { TextInput } from '@inkjs/ui';
import { saveApiKey, maskApiKey } from '../storage/api-key-store.js';
import { useAppContext } from '../state/app-context.js';

export function ApiKeySetupScreen() {
  const { navigate, setError } = useAppContext();
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setIsSaving(true);
    const result = await saveApiKey(trimmed);

    if (result.ok) {
      navigate('home');
    } else {
      setError(result.error.message);
      navigate('error');
    }
    setIsSaving(false);
  }, [navigate, setError]);

  useInput((input, key) => {
    if (key.escape) {
      navigate('home');
    }
    if (input === 't' && key.ctrl) {
      setShowKey(!showKey);
    }
  });

  const displayValue = showKey ? apiKey : apiKey.replace(/./g, '*');

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Gemini API Key Setup</Text>

      <Box marginTop={1} flexDirection="column">
        <Text>Enter your Gemini API key to enable AI code review.</Text>
        <Text dimColor>Get your key at: https://aistudio.google.com/apikey</Text>
      </Box>

      <Box marginTop={2} flexDirection="column">
        <Text>API Key:</Text>
        <Box>
          <Text color="cyan">&gt; </Text>
          <TextInput
            value={apiKey}
            onChange={setApiKey}
            onSubmit={handleSubmit}
            placeholder="Enter your API key..."
          />
        </Box>
        {apiKey.length > 0 && (
          <Text dimColor>Preview: {maskApiKey(apiKey)}</Text>
        )}
      </Box>

      <Box marginTop={2} flexDirection="column">
        <Text dimColor>Press Enter to save | ESC to cancel | Ctrl+T to toggle visibility</Text>
        {isSaving && <Text color="yellow">Saving...</Text>}
      </Box>
    </Box>
  );
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
