---
id: task-105
title: Create ChatMessage component
status: completed
priority: high
labels:
  - cli
  - tui
  - components
created: '2025-01-06'
order: 105
assignee: glm
---

## Description

Create the ChatMessage component that renders a single chat message with role indicator and timestamp.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/components/ChatMessage.tsx`
- [ ] Display role (You/System/Stargazer) with appropriate color
- [ ] Display relative timestamp using date-fns
- [ ] Display message content indented

## Implementation

**File**: `packages/cli/src/tui/components/ChatMessage.tsx`

```typescript
import React from 'react';
import { Box, Text } from 'ink';
import type { ChatMessage as ChatMessageType } from '../storage/types.js';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const roleColor = isUser ? 'blue' : isSystem ? 'yellow' : 'green';
  const roleLabel = isUser ? 'You' : isSystem ? 'System' : 'Stargazer';

  const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });

  return (
    <Box flexDirection="column" marginY={1}>
      <Box flexDirection="row" gap={1}>
        <Text bold color={roleColor}>
          {roleLabel}
        </Text>
        <Text dimColor>
          {timeAgo}
        </Text>
      </Box>
      <Box marginLeft={2}>
        <Text>{message.content}</Text>
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
