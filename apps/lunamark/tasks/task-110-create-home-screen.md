---
id: task-110
title: Create HomeScreen
status: completed
priority: high
labels:
  - cli
  - tui
  - screens
created: '2025-01-06'
order: 110
assignee: glm
---

## Description

Create the HomeScreen that displays the main menu and refreshes sessions on mount.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/screens/HomeScreen.tsx`
- [ ] Render MainMenu component
- [ ] Refresh sessions on mount using useEffect

## Implementation

**File**: `packages/cli/src/tui/screens/HomeScreen.tsx`

```typescript
import React, { useEffect } from 'react';
import { Box } from 'ink';
import { MainMenu } from '../components/MainMenu.js';
import { useApp } from '../state/app-context.js';

export function HomeScreen() {
  const { refreshSessions } = useApp();

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <MainMenu />
    </Box>
  );
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
