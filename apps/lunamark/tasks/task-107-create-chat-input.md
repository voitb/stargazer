---
id: task-107
title: Create ChatInput component
status: completed
priority: high
labels:
  - cli
  - tui
  - components
created: '2025-01-06'
order: 107
assignee: glm
---

## Description

Create the ChatInput component with text input and submit handling.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/components/ChatInput.tsx`
- [ ] Use @inkjs/ui TextInput component
- [ ] Display prompt character (>)
- [ ] Call onSubmit with trimmed input
- [ ] Clear input after submission

## Implementation

**File**: `packages/cli/src/tui/components/ChatInput.tsx`

```typescript
import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { TextInput } from '@inkjs/ui';

interface ChatInputProps {
  onSubmit: (input: string) => void;
  placeholder?: string;
}

export function ChatInput({ onSubmit, placeholder = 'Type a command...' }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (input: string) => {
    if (input.trim()) {
      onSubmit(input.trim());
      setValue('');
    }
  };

  return (
    <Box
      flexDirection="row"
      paddingX={1}
      borderStyle="single"
      borderTop
    >
      <Text color="cyan" bold>
        {'> '}
      </Text>
      <TextInput
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        placeholder={placeholder}
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
