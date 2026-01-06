import { Box, Text } from 'ink';
import { ChatMessage } from './chat-message.js';

interface MessageData {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface ChatViewProps {
  messages: readonly MessageData[];
}

export function ChatView({ messages }: ChatViewProps) {
  if (messages.length === 0) {
    return (
      <Box padding={1}>
        <Text dimColor>No messages yet. Type a command to get started.</Text>
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
