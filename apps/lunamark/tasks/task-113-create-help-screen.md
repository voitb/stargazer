---
id: task-113
title: Create HelpScreen
status: completed
priority: medium
labels:
  - cli
  - tui
  - screens
created: '2025-01-06'
order: 113
assignee: glm
---

## Description

Create the HelpScreen that displays keyboard shortcuts and available commands.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/screens/HelpScreen.tsx`
- [ ] Display keyboard shortcuts section
- [ ] Display chat commands section
- [ ] Handle ESC or Q to go back

## Implementation

**File**: `packages/cli/src/tui/screens/HelpScreen.tsx`

```typescript
import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useApp } from '../state/app-context.js';

export function HelpScreen() {
  const { navigate } = useApp();

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      navigate('home');
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan" marginBottom={1}>
        Stargazer Help
      </Text>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold>Keyboard Shortcuts:</Text>
        <Text>  Ctrl+C    Exit application</Text>
        <Text>  Escape    Go back / Cancel</Text>
        <Text>  Enter     Select / Submit</Text>
        <Text>  ↑/↓       Navigate lists</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold>Chat Commands:</Text>
        <Text>  /review staged     Review staged changes</Text>
        <Text>  /review unstaged   Review unstaged changes</Text>
        <Text>  /discover          Discover conventions</Text>
        <Text>  /clear             Clear chat</Text>
        <Text>  /exit              Exit to menu</Text>
        <Text>  /help              Show help</Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Press ESC or Q to go back</Text>
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
