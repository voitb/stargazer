import { useState, useCallback } from 'react';
import { Box, useInput } from 'ink';
import { Spinner } from '@inkjs/ui';
import type { ReviewResult } from '@stargazer/core';
import { ChatView } from './components/chat-view.js';
import { EnhancedChatInput } from './components/enhanced-chat-input.js';
import { useAppContext } from '../../state/app-context.js';
import { useReview } from '../review/index.js';
import { StatusText } from '../../design-system/index.js';

export function ChatScreen() {
  const { activeSession, addMessage, closeSession, clearMessages, projectPath, isLoading } = useAppContext();
  const { isReviewing, reviewStaged, reviewUnstaged } = useReview({ projectPath });
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleSubmit = useCallback(async (input: string) => {
    if (!activeSession) return;

    await addMessage({
      role: 'user',
      content: input,
      command: input.startsWith('/') ? input : undefined,
    });

    // Handle commands
    if (input.startsWith('/')) {
      await handleCommand(input);
      return;
    }

    // For non-command messages, we could integrate LLM here
    // For now, show a placeholder response
    setIsProcessing(true);
    try {
      // TODO: Integrate with actual LLM provider
      await addMessage({
        role: 'system',
        content: 'Chat with LLM is not yet implemented. Use /help for available commands.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [activeSession, addMessage]);

  const handleCommand = useCallback(async (input: string) => {
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

    if (input === '/clear') {
      await clearMessages();
      return;
    }

    if (input === '/review staged' || input === '/rs') {
      await addMessage({ role: 'system', content: 'Reviewing staged changes...' });
      setIsProcessing(true);
      try {
        const result = await reviewStaged();
        if (result) {
          await addMessage({ role: 'assistant', content: formatReviewResult(result) });
        } else {
          await addMessage({ role: 'system', content: 'Review failed. Please check your API key and try again.' });
        }
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (input === '/review unstaged' || input === '/ru') {
      await addMessage({ role: 'system', content: 'Reviewing unstaged changes...' });
      setIsProcessing(true);
      try {
        const result = await reviewUnstaged();
        if (result) {
          await addMessage({ role: 'assistant', content: formatReviewResult(result) });
        } else {
          await addMessage({ role: 'system', content: 'Review failed. Please check your API key and try again.' });
        }
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    await addMessage({
      role: 'system',
      content: `Unknown command: ${input}. Type /help for available commands.`,
    });
  }, [addMessage, closeSession, clearMessages, reviewStaged, reviewUnstaged, formatReviewResult]);

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

  const showLoading = isReviewing || isProcessing || isLoading;

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
      <EnhancedChatInput
        onSubmit={handleSubmit}
        isLoading={showLoading}
        disabled={showLoading}
        placeholder="Type /help for commands..."
      />
    </Box>
  );
}
