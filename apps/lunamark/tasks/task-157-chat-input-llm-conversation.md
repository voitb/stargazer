---
id: task-157
title: Add functional chat input for LLM conversation
status: pending
priority: high
labels:
  - cli
  - feature
  - chat
created: '2025-01-10'
order: 157
assignee: ai-agent
depends_on:
  - task-154
---

## Description

Add a functional text input at the bottom of the chat screen so users can have conversations with the LLM, similar to Claude Code and OpenCode.

## Requirements

1. Text input at the bottom of chat screen
2. Multi-line input support (Shift+Enter for new line)
3. Input history (up/down arrows navigate previous inputs)
4. Visual feedback when LLM is processing
5. Auto-focus on input field
6. Send message on Enter

## Current State

The ChatInput component exists at `packages/cli/src/tui/features/chat/components/chat-input.tsx` but it's limited and needs enhancement.

## Implementation

### Step 1: Create enhanced input component

**File:** `packages/cli/src/tui/features/chat/components/enhanced-chat-input.tsx` (create)

```typescript
import { useState, useCallback, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useTheme, StarSpinner, TokenBadge } from '../../../design-system/index.js';

interface EnhancedChatInputProps {
  onSubmit: (input: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  tokenCount?: number;
  tokenLimit?: number;
  inputHistory?: string[];
}

export function EnhancedChatInput({
  onSubmit,
  placeholder = 'Type a message... (/ for commands, @ for files)',
  disabled = false,
  isLoading = false,
  tokenCount,
  tokenLimit,
  inputHistory = [],
}: EnhancedChatInputProps) {
  const { colors } = useTheme();
  const [value, setValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const previousValue = useRef('');

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled && !isLoading) {
      onSubmit(trimmed);
      setValue('');
      setHistoryIndex(-1);
      previousValue.current = '';
    }
  }, [value, disabled, isLoading, onSubmit]);

  useInput((input, key) => {
    if (disabled || isLoading) return;

    // Submit on Enter (without shift)
    if (key.return && !key.shift) {
      handleSubmit();
      return;
    }

    // Navigate history with up/down arrows when input is empty or at start
    if (key.upArrow && inputHistory.length > 0) {
      if (historyIndex === -1) {
        previousValue.current = value;
      }
      const newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
      setHistoryIndex(newIndex);
      setValue(inputHistory[inputHistory.length - 1 - newIndex] || '');
      return;
    }

    if (key.downArrow && historyIndex >= 0) {
      const newIndex = historyIndex - 1;
      if (newIndex < 0) {
        setHistoryIndex(-1);
        setValue(previousValue.current);
      } else {
        setHistoryIndex(newIndex);
        setValue(inputHistory[inputHistory.length - 1 - newIndex] || '');
      }
      return;
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={isLoading ? colors.border.warning : colors.border.focus}
      paddingX={1}
    >
      <Box flexDirection="row" justifyContent="space-between">
        <Box flexGrow={1}>
          {isLoading ? (
            <Box gap={1}>
              <StarSpinner />
              <Text dimColor>Thinking...</Text>
            </Box>
          ) : (
            <TextInput
              value={value}
              onChange={setValue}
              onSubmit={handleSubmit}
              placeholder={placeholder}
              focus={!disabled}
            />
          )}
        </Box>
        {tokenCount !== undefined && tokenLimit !== undefined && (
          <Box marginLeft={2}>
            <TokenBadge current={tokenCount} limit={tokenLimit} />
          </Box>
        )}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          Enter send • ↑↓ history • Shift+Enter newline • / commands • @ files
        </Text>
      </Box>
    </Box>
  );
}
```

### Step 2: Update chat screen to use enhanced input

**File:** `packages/cli/src/tui/features/chat/chat-screen.tsx`

```typescript
import { Box, Text, useInput } from 'ink';
import { useState, useCallback } from 'react';
import { ChatView } from './components/chat-view.js';
import { EnhancedChatInput } from './components/enhanced-chat-input.js';
import { useChat } from './chat.context.js';
import { useAppContext } from '../../state/app-context.js';

export function ChatScreen() {
  const { activeSession, addMessage, isLoading } = useChat();
  const { navigate } = useAppContext();
  const [inputHistory, setInputHistory] = useState<string[]>([]);

  const handleSubmit = useCallback(async (input: string) => {
    // Save to input history
    setInputHistory(prev => [...prev, input]);

    // Check for commands
    if (input.startsWith('/')) {
      handleCommand(input);
      return;
    }

    // Send message to LLM
    await addMessage({
      role: 'user',
      content: input,
    });

    // LLM response will be handled by the chat context
  }, [addMessage]);

  const handleCommand = useCallback((command: string) => {
    const [cmd, ...args] = command.slice(1).split(' ');

    switch (cmd) {
      case 'help':
        // Show help
        break;
      case 'clear':
        // Clear conversation
        break;
      case 'exit':
      case 'quit':
        navigate('home');
        break;
      case 'review':
        navigate('home');
        // Trigger review
        break;
      default:
        // Unknown command
        addMessage({
          role: 'system',
          content: `Unknown command: /${cmd}. Type /help for available commands.`,
        });
    }
  }, [navigate, addMessage]);

  if (!activeSession) {
    return (
      <Box padding={1}>
        <Text dimColor>No active session. Start a new conversation.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Messages area */}
      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        <ChatView messages={activeSession.messages} />
      </Box>

      {/* Input area */}
      <EnhancedChatInput
        onSubmit={handleSubmit}
        isLoading={isLoading}
        inputHistory={inputHistory}
        tokenCount={activeSession.tokenCount}
        tokenLimit={activeSession.tokenLimit}
      />
    </Box>
  );
}
```

### Step 3: Update chat context with LLM integration

**File:** `packages/cli/src/tui/features/chat/chat.context.tsx`

Add actual LLM call:

```typescript
import { generateContent } from '@stargazer/ai-providers';

const addMessage = useCallback(async (message: NewMessage) => {
  if (!activeSessionId) return;

  // Add user message
  const userMessage = await addMessageToSession(activeSessionId, message);
  setActiveSession(prev => ({
    ...prev!,
    messages: [...prev!.messages, userMessage],
  }));

  // If it's a user message, get LLM response
  if (message.role === 'user') {
    setIsLoading(true);
    try {
      const response = await generateContent({
        model: currentModel,
        messages: activeSession!.messages.concat(userMessage),
        systemPrompt: getSystemPrompt(projectPath),
      });

      const assistantMessage = await addMessageToSession(activeSessionId, {
        role: 'assistant',
        content: response.text,
        tokenCount: response.tokenCount,
      });

      setActiveSession(prev => ({
        ...prev!,
        messages: [...prev!.messages, assistantMessage],
        tokenCount: prev!.tokenCount + response.tokenCount,
      }));
    } catch (error) {
      // Add error as system message
      await addMessageToSession(activeSessionId, {
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  }
}, [activeSessionId, activeSession, currentModel, projectPath]);
```

### Step 4: Install ink-text-input

**File:** `packages/cli/package.json`

Add dependency:
```json
{
  "dependencies": {
    "ink-text-input": "^6.0.0"
  }
}
```

Run: `pnpm install`

## Acceptance Criteria

- [ ] Text input appears at bottom of chat screen
- [ ] Enter key sends message
- [ ] Up/Down arrows navigate input history
- [ ] Loading spinner shows while LLM is processing
- [ ] Token count displays in input area
- [ ] Commands starting with / are handled
- [ ] Input is disabled during LLM processing

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm install
pnpm exec tsc --noEmit

# Manual test:
# 1. Start CLI
# 2. Navigate to chat (or start new session)
# 3. Type a message and press Enter
# 4. Verify message appears in chat
# 5. Verify LLM response appears
# 6. Press Up arrow to see input history
# 7. Type /help to test commands
```

## Files Changed

- CREATE: `packages/cli/src/tui/features/chat/components/enhanced-chat-input.tsx`
- UPDATE: `packages/cli/src/tui/features/chat/chat-screen.tsx`
- UPDATE: `packages/cli/src/tui/features/chat/chat.context.tsx`
- UPDATE: `packages/cli/src/tui/features/chat/components/index.ts`
- UPDATE: `packages/cli/package.json`
