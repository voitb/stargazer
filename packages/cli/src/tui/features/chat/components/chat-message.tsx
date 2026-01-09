import { Box, Text } from 'ink';
import { formatDistanceToNow } from 'date-fns';

type MessageRole = 'user' | 'assistant' | 'system';

interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

function getRoleDisplay(role: MessageRole): { label: string; color: string } {
  switch (role) {
    case 'user':
      return { label: 'You', color: 'blue' };
    case 'assistant':
      return { label: 'Stargazer', color: 'green' };
    case 'system':
      return { label: 'System', color: 'yellow' };
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { label, color } = getRoleDisplay(message.role);
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });

  return (
    <Box flexDirection="column" marginY={1}>
      <Box flexDirection="row" gap={1}>
        <Text bold color={color}>
          {label}
        </Text>
        <Text dimColor>{timeAgo}</Text>
      </Box>
      <Box marginLeft={2}>
        <Text>{message.content}</Text>
      </Box>
    </Box>
  );
}
