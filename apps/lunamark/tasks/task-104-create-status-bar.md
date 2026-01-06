---
id: task-104
title: Create StatusBar component
status: completed
priority: medium
labels:
  - cli
  - tui
  - components
created: '2025-01-06'
order: 104
assignee: glm
---

## Description

Create the StatusBar component that shows session count, API connection status, and help hint.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/components/StatusBar.tsx`
- [ ] Display session count
- [ ] Display API key status (green checkmark or red X)
- [ ] Display help hint

## Implementation

**File**: `packages/cli/src/tui/components/StatusBar.tsx`

```typescript
import React from 'react';
import { Box, Text } from 'ink';

interface StatusBarProps {
  sessionCount: number;
  hasApiKey: boolean;
}

export function StatusBar({ sessionCount, hasApiKey }: StatusBarProps) {
  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      paddingX={1}
      borderStyle="single"
      borderTop
    >
      <Text dimColor>
        Sessions: {sessionCount}
      </Text>
      <Text color={hasApiKey ? 'green' : 'red'}>
        API: {hasApiKey ? '✓ Connected' : '✗ No API Key'}
      </Text>
      <Text dimColor>
        Press ? for help
      </Text>
    </Box>
  );
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
