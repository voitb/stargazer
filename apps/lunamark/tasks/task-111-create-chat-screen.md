---
id: task-111
title: Create ChatScreen
status: pending
priority: high
labels:
  - cli
  - tui
  - screens
created: '2025-01-06'
order: 111
assignee: glm
---

## Description

Create the ChatScreen that displays the chat interface with message history and input.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/screens/ChatScreen.tsx`
- [ ] Render ChatView with messages from active session
- [ ] Render ChatInput for user commands
- [ ] Handle slash commands (/help, /exit, /review staged, /review unstaged)
- [ ] Show loading spinner during review

## Implementation

**File**: `packages/cli/src/tui/screens/ChatScreen.tsx`

```typescript
import React, { useCallback } from 'react';
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { ChatView } from '../components/ChatView.js';
import { ChatInput } from '../components/ChatInput.js';
import { useApp } from '../state/app-context.js';
import { useReview } from '../hooks/use-review.js';

export function ChatScreen() {
  const { activeSession, addMessage, closeSession } = useApp();
  const { isReviewing, error: reviewError, reviewStaged, reviewUnstaged } = useReview();

  const formatReviewResult = (result: any): string => {
    if (!result) return 'No results';

    const lines: string[] = [];
    lines.push(`Decision: ${result.decision}`);
    lines.push(`Summary: ${result.summary}`);

    if (result.issues && result.issues.length > 0) {
      lines.push(`\nIssues found: ${result.issues.length}`);
      result.issues.forEach((issue: any, i: number) => {
        lines.push(`\n${i + 1}. [${issue.severity}] ${issue.file}:${issue.line}`);
        lines.push(`   ${issue.message}`);
        if (issue.suggestion) {
          lines.push(`   Suggestion: ${issue.suggestion}`);
        }
      });
    } else {
      lines.push('\nNo issues found!');
    }

    return lines.join('\n');
  };

  const handleCommand = useCallback(async (input: string) => {
    // Add user message
    await addMessage({
      role: 'user',
      content: input,
      command: input.startsWith('/') ? input : undefined,
    });

    // Handle commands
    if (input === '/exit' || input === '/quit') {
      closeSession();
      return;
    }

    if (input === '/help') {
      await addMessage({
        role: 'system',
        content: `Available commands:
/review staged - Review staged git changes
/review unstaged - Review unstaged git changes
/discover - Discover project conventions
/clear - Clear chat history
/exit - Exit to main menu
/help - Show this help`,
      });
      return;
    }

    if (input === '/review staged' || input === '/rs') {
      await addMessage({
        role: 'system',
        content: 'Reviewing staged changes...',
      });

      const result = await reviewStaged();
      if (result) {
        await addMessage({
          role: 'assistant',
          content: formatReviewResult(result),
        });
      } else if (reviewError) {
        await addMessage({
          role: 'system',
          content: `Error: ${reviewError}`,
        });
      }
      return;
    }

    if (input === '/review unstaged' || input === '/ru') {
      await addMessage({
        role: 'system',
        content: 'Reviewing unstaged changes...',
      });

      const result = await reviewUnstaged();
      if (result) {
        await addMessage({
          role: 'assistant',
          content: formatReviewResult(result),
        });
      } else if (reviewError) {
        await addMessage({
          role: 'system',
          content: `Error: ${reviewError}`,
        });
      }
      return;
    }

    // Unknown command
    await addMessage({
      role: 'system',
      content: `Unknown command: ${input}. Type /help for available commands.`,
    });
  }, [addMessage, closeSession, reviewStaged, reviewUnstaged, reviewError]);

  if (!activeSession) {
    return (
      <Box padding={1}>
        <Text color="red">No active session</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        <ChatView messages={activeSession.messages} />
        {isReviewing && (
          <Box padding={1}>
            <Spinner label="Running review..." />
          </Box>
        )}
      </Box>
      <ChatInput
        onSubmit={handleCommand}
        placeholder="Type /help for commands..."
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
