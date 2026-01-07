---
id: task-128
title: Create help screen with keyboard shortcuts
status: completed
priority: medium
labels:
  - cli
  - tui
  - ui
  - help
created: '2026-01-07'
order: 128
assignee: glm
---

## Description

Create a help screen that displays available keyboard shortcuts and navigation instructions.

## Acceptance Criteria

- [x] Create `packages/cli/src/tui/screens/help-screen.tsx`
- [x] Display keyboard shortcuts section
- [x] Display menu options section
- [x] Handle ESC to go back to previous screen
- [x] Use consistent styling with other screens

## Implementation

**File**: `packages/cli/src/tui/screens/help-screen.tsx`

```typescript
import { Box, Text, useInput } from 'ink';
import { useAppContext } from '../state/app-context.js';

export function HelpScreen() {
  const { navigate } = useAppContext();

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      navigate('home');
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Help</Text>

      <Box marginTop={1} flexDirection="column">
        <Text bold>Keyboard Shortcuts:</Text>
        <Text>  ESC / Q    - Go back / Exit</Text>
        <Text>  Ctrl+C     - Force quit</Text>
        <Text>  Enter      - Select option</Text>
        <Text>  Arrow keys - Navigate menus</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text bold>Menu Options:</Text>
        <Text>  Review Staged     - Review git staged changes</Text>
        <Text>  Review Unstaged   - Review git unstaged changes</Text>
        <Text>  Session History   - Browse previous sessions</Text>
        <Text>  Settings          - Configure API key and preferences</Text>
      </Box>

      <Box marginTop={2}>
        <Text dimColor>Press ESC or Q to go back</Text>
      </Box>
    </Box>
  );
}
```

**File**: `packages/cli/src/tui/screens/index.ts`

Add export:

```typescript
export { HelpScreen } from './help-screen.js';
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
pnpm build
node dist/index.js
# Navigate to Help from menu
```
