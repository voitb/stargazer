import { Box, Text } from 'ink';
import { formatDistanceToNow } from 'date-fns';
import { STAR_ICONS } from '../../../design-system/palettes.js';

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

// Star-themed role display with design system colors
const ROLE_DISPLAY: Record<MessageRole, { label: string; color: string; icon: string }> = {
  user: {
    label: 'You',
    color: '#38bdf8', // info/sky-400
    icon: STAR_ICONS.filled, // ✦
  },
  assistant: {
    label: 'Stargazer',
    color: '#4ade80', // success/green-400
    icon: STAR_ICONS.star, // ★
  },
  system: {
    label: 'System',
    color: '#fbbf24', // warning/amber-400
    icon: STAR_ICONS.diamond, // ◇
  },
};

export function ChatMessage({ message }: ChatMessageProps) {
  const { label, color, icon } = ROLE_DISPLAY[message.role];
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });

  return (
    <Box flexDirection="column" marginY={1}>
      <Box flexDirection="row" gap={1}>
        <Text bold color={color}>
          {icon} {label}
        </Text>
        <Text dimColor>{timeAgo}</Text>
      </Box>
      <Box marginLeft={2}>
        <Text>{message.content}</Text>
      </Box>
    </Box>
  );
}
