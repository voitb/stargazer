import { useState, useCallback, useMemo } from 'react';
import { Box, useInput } from 'ink';
import { Spinner } from '@inkjs/ui';
import { ChatView } from './components/chat-view.js';
import { EnhancedChatInput } from './components/enhanced-chat-input.js';
import { useAppContext } from '../../state/app-context.js';
import { StatusText } from '../../design-system/index.js';
import { executeCommand, isCommand, type CommandContext } from './commands/index.js';
import type { ReviewActions } from '../review/types.js';
import { formatReviewResult } from '../review/utils/format-result.js';

interface ChatScreenProps {
  reviewActions: ReviewActions;
}

export function ChatScreen({ reviewActions }: ChatScreenProps) {
  const { activeSession, addMessage, closeSession, clearMessages, isLoading, navigate, projectPath } = useAppContext();
  const { isReviewing, reviewStaged, reviewUnstaged } = reviewActions;
  const [isProcessing, setIsProcessing] = useState(false);

  // Create command context for the executor
  const commandContext: CommandContext = useMemo(() => ({
    navigate,
    clearMessages,
    addSystemMessage: async (content: string) => {
      await addMessage({ role: 'system', content });
    },
    closeSession,
    projectPath,
  }), [navigate, clearMessages, addMessage, closeSession, projectPath]);

  // Handle special command outputs (e.g., __COMMAND__:review:staged)
  const handleSpecialCommand = useCallback(async (output: string): Promise<boolean> => {
    if (!output.startsWith('__COMMAND__:')) return false;

    const [, action, param] = output.split(':');

    if (action === 'review') {
      const reviewFn = param === 'unstaged' ? reviewUnstaged : reviewStaged;
      await addMessage({ role: 'system', content: `Reviewing ${param || 'staged'} changes...` });
      setIsProcessing(true);
      try {
        const result = await reviewFn();
        if (result) {
          await addMessage({ role: 'assistant', content: formatReviewResult(result) });
        } else {
          await addMessage({ role: 'system', content: 'Review failed. Please check your API key and try again.' });
        }
      } finally {
        setIsProcessing(false);
      }
      return true;
    }

    return false;
  }, [reviewStaged, reviewUnstaged, addMessage]);

  const handleSubmit = useCallback(async (input: string) => {
    if (!activeSession) return;

    await addMessage({
      role: 'user',
      content: input,
      command: isCommand(input) ? input : undefined,
    });

    // Handle commands using the command system
    if (isCommand(input)) {
      const result = await executeCommand(input, commandContext);

      if (result.success && result.output) {
        // Check for special command outputs
        const wasSpecial = await handleSpecialCommand(result.output);
        if (!wasSpecial) {
          await addMessage({ role: 'system', content: result.output });
        }
      } else if (!result.success && result.error) {
        await addMessage({ role: 'system', content: result.error });
      }
      return;
    }

    // For non-command messages, we could integrate LLM here
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
  }, [activeSession, addMessage, commandContext, handleSpecialCommand]);

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
