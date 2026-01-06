---
id: task-112
title: Create HistoryScreen
status: pending
priority: medium
labels:
  - cli
  - tui
  - screens
created: '2025-01-06'
order: 112
assignee: glm
---

## Description

Create the HistoryScreen that displays all previous sessions for browsing and resumption.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/screens/HistoryScreen.tsx`
- [ ] Render SessionList with all sessions
- [ ] Handle session selection to resume
- [ ] Handle back navigation to home

## Implementation

**File**: `packages/cli/src/tui/screens/HistoryScreen.tsx`

```typescript
import React from 'react';
import { Box, Text } from 'ink';
import { SessionList } from '../components/SessionList.js';
import { useApp } from '../state/app-context.js';

export function HistoryScreen() {
  const { sessions, resumeSession, navigate } = useApp();

  const handleSelect = async (sessionId: string) => {
    await resumeSession(sessionId);
  };

  const handleBack = () => {
    navigate('home');
  };

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box paddingX={1} marginBottom={1}>
        <Text bold>Session History</Text>
      </Box>
      <SessionList
        sessions={sessions}
        onSelect={handleSelect}
        onBack={handleBack}
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
