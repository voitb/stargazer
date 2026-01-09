import { Box, Text } from 'ink';
import { formatDistanceToNow } from 'date-fns';
import {
  STAR_ICONS,
  ROLE_COLORS,
  type MessageRole,
} from '../../../design-system/tokens/index.js';
import { useTheme } from '../../../design-system/primitives/theme-provider.js';

interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

// Star-themed role display with design system icons
const ROLE_LABELS: Record<MessageRole, { label: string; icon: string }> = {
  user: {
    label: 'You',
    icon: STAR_ICONS.filled, // ✦
  },
  assistant: {
    label: 'Stargazer',
    icon: STAR_ICONS.star, // ★
  },
  system: {
    label: 'System',
    icon: STAR_ICONS.diamond, // ◇
  },
};

export function ChatMessage({ message }: ChatMessageProps) {
  const { theme } = useTheme();
  const { label, icon } = ROLE_LABELS[message.role];
  const color = ROLE_COLORS[message.role][theme];
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
