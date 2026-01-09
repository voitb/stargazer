import { useCallback } from 'react';
import { Box, useInput } from 'ink';
import { Spinner } from '@inkjs/ui';
import type { ReviewResult } from '@stargazer/core';
import { ChatView } from './components/chat-view.js';
import { ChatInput } from './components/chat-input.js';
import { useAppContext } from '../../state/app-context.js';
import { useReview } from '../review/index.js';
import { StatusText } from '../../design-system/index.js';

export function ChatScreen() {
  const { activeSession, addMessage, closeSession, projectPath } = useAppContext();
  const { isReviewing, reviewStaged, reviewUnstaged } = useReview({ projectPath });

  const formatReviewResult = useCallback((reviewResult: ReviewResult): string => {
    const lines: string[] = [];
    if (reviewResult.decision) lines.push(`Decision: ${reviewResult.decision}`);
    if (reviewResult.summary) lines.push(`Summary: ${reviewResult.summary}`);

    if (reviewResult.issues && reviewResult.issues.length > 0) {
      lines.push(`\nIssues found: ${reviewResult.issues.length}`);
      reviewResult.issues.forEach((issue, i) => {
        lines.push(`\n${i + 1}. [${issue.severity || 'info'}] ${issue.file || 'unknown'}:${issue.line || 0}`);
        if (issue.message) lines.push(`   ${issue.message}`);
        if (issue.suggestion) lines.push(`   Suggestion: ${issue.suggestion}`);
      });
    } else {
      lines.push('\nNo issues found!');
    }

    return lines.join('\n');
  }, []);

  const handleCommand = useCallback(async (input: string) => {
    if (!activeSession) return;

    await addMessage({
      role: 'user',
      content: input,
      command: input.startsWith('/') ? input : undefined,
    });

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
/clear - Clear chat history
/exit - Exit to main menu
/help - Show this help`,
      });
      return;
    }

    if (input === '/review staged' || input === '/rs') {
      await addMessage({ role: 'system', content: 'Reviewing staged changes...' });
      const result = await reviewStaged();
      if (result) {
        await addMessage({ role: 'assistant', content: formatReviewResult(result) });
      } else {
        await addMessage({ role: 'system', content: 'Review failed. Please check your API key and try again.' });
      }
      return;
    }

    if (input === '/review unstaged' || input === '/ru') {
      await addMessage({ role: 'system', content: 'Reviewing unstaged changes...' });
      const result = await reviewUnstaged();
      if (result) {
        await addMessage({ role: 'assistant', content: formatReviewResult(result) });
      } else {
        await addMessage({ role: 'system', content: 'Review failed. Please check your API key and try again.' });
      }
      return;
    }

    await addMessage({
      role: 'system',
      content: `Unknown command: ${input}. Type /help for available commands.`,
    });
  }, [activeSession, addMessage, closeSession, reviewStaged, reviewUnstaged, formatReviewResult]);

  useInput((input, key) => {
    if (key.escape) {
      closeSession();
    }
  });

  if (!activeSession) {
    return (
      <Box padding={1}>
        <StatusText variant="error" withIcon>No active session. Press ESC to go back.</StatusText>
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
      <ChatInput onSubmit={handleCommand} placeholder="Type /help for commands..." />
    </Box>
  );
}
