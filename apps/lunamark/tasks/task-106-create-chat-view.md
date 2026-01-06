---
id: task-106
title: Create ChatView component
status: completed
priority: high
labels:
  - cli
  - tui
  - components
created: '2025-01-06'
order: 106
assignee: glm
---

## Description

Create the ChatView component that displays a list of chat messages or an empty state.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/components/ChatView.tsx`
- [ ] Map over messages array and render ChatMessage components
- [ ] Show empty state when no messages

## Implementation

**File**: `packages/cli/src/tui/components/ChatView.tsx`

```typescript
import React from 'react';
import { Box, Text } from 'ink';
import { ChatMessage } from './ChatMessage.js';
import type { ChatMessage as ChatMessageType } from '../storage/types.js';

interface ChatViewProps {
  messages: readonly ChatMessageType[];
}

export function ChatView({ messages }: ChatViewProps) {
  if (messages.length === 0) {
    return (
      <Box padding={1}>
        <Text dimColor>
          No messages yet. Type a command to get started.
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </Box>
  );
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
