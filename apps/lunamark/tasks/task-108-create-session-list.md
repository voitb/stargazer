---
id: task-108
title: Create SessionList component
status: completed
priority: medium
labels:
  - cli
  - tui
  - components
created: '2025-01-06'
order: 108
assignee: glm
---

## Description

Create the SessionList component that displays previous sessions with selection.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/components/SessionList.tsx`
- [ ] Display sessions with project name, relative time, message count
- [ ] Use @inkjs/ui Select for selection
- [ ] Include "Back to menu" option
- [ ] Show empty state when no sessions

## Implementation

**File**: `packages/cli/src/tui/components/SessionList.tsx`

```typescript
import React from 'react';
import { Box, Text } from 'ink';
import { Select } from '@inkjs/ui';
import type { SessionIndexEntry } from '../storage/types.js';
import { formatDistanceToNow } from 'date-fns';

interface SessionListProps {
  sessions: readonly SessionIndexEntry[];
  onSelect: (sessionId: string) => void;
  onBack: () => void;
}

export function SessionList({ sessions, onSelect, onBack }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text dimColor>No previous sessions found.</Text>
        <Box marginTop={1}>
          <Text dimColor>Press ESC to go back</Text>
        </Box>
      </Box>
    );
  }

  const options = [
    ...sessions.map((session) => ({
      label: `${session.projectName} - ${formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })} (${session.messageCount} messages)`,
      value: session.id,
    })),
    { label: '← Back to menu', value: 'back' },
  ];

  const handleSelect = (value: string) => {
    if (value === 'back') {
      onBack();
    } else {
      onSelect(value);
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold marginBottom={1}>
        Previous Sessions
      </Text>
      <Select options={options} onChange={handleSelect} />
    </Box>
  );
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
