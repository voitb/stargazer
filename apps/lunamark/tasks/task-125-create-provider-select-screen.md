---
id: task-125
title: Create provider selection screen
status: completed
priority: high
labels:
  - cli
  - tui
  - ui
  - providers
created: '2026-01-07'
order: 125
assignee: glm
---

## Description

Create a TUI screen for selecting the AI provider (Google Gemini or ZhipuAI GLM-4) during initial setup.

## Acceptance Criteria

- [x] Create `packages/cli/src/tui/screens/provider-select-screen.tsx`
- [x] Display welcome message with Stargazer branding
- [x] Show list of available providers with icons
- [x] Support Google Gemini (recommended) and GLM-4 (ZhipuAI)
- [x] Navigate to API key setup after selection
- [x] Use arrow keys for navigation, Enter to select

## Implementation

**File**: `packages/cli/src/tui/screens/provider-select-screen.tsx`

```typescript
import { Box, Text, useInput } from 'ink';
import { Select } from '@inkjs/ui';
import { useAppContext } from '../state/app-context.js';

const providerOptions = [
  { label: '🔮 Google Gemini (Recommended)', value: 'gemini' },
  { label: '🤖 GLM-4 (ZhipuAI)', value: 'glm' },
];

export function ProviderSelectScreen() {
  const { navigate } = useAppContext();

  const handleSelect = (value: string) => {
    navigate('apiKeySetup');
  };

  useInput(() => {
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Welcome to Stargazer</Text>

      <Box marginTop={1} flexDirection="column">
        <Text>Select your AI provider to get started:</Text>
      </Box>

      <Box marginTop={2}>
        <Select options={providerOptions} onChange={handleSelect} />
      </Box>

      <Box marginTop={2} flexDirection="column">
        <Text dimColor>Use arrow keys to navigate, Enter to select</Text>
      </Box>
    </Box>
  );
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
pnpm build
node dist/index.js
# Should show provider selection on first launch
```
