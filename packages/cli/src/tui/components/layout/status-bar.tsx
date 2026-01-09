import { Box, Text } from 'ink';
import { Badge, CountBadge, STAR_ICONS, useTheme } from '../../design-system/index.js';

interface StatusBarProps {
  message: string;
  sessionCount?: number;
  hasApiKey?: boolean;
}

/**
 * Status bar with star-themed styling
 *
 * Features:
 * - Badge components for status indicators
 * - Theme-aware border colors
 * - KeyHint styling for navigation hints
 * - Clean, minimal layout
 *
 * Following CLI_ARCHITECTURE.md layout component guidelines.
 */
export function StatusBar({ message, sessionCount, hasApiKey }: StatusBarProps) {
  const { colors } = useTheme();

  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      paddingX={1}
      borderStyle="single"
      borderTop
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      borderColor={colors.border.subtle}
    >
      <Text dimColor>{STAR_ICONS.outline} {message}</Text>
      <Box gap={2}>
        {hasApiKey !== undefined && (
          <Badge variant={hasApiKey ? 'success' : 'error'} gradient>
            API
          </Badge>
        )}
        {sessionCount !== undefined && (
          <CountBadge count={sessionCount} variant="info" label="sessions" />
        )}
      </Box>
    </Box>
  );
}

/**
 * Minimal status bar - just the message
 */
export function MinimalStatusBar({ message }: { message: string }) {
  return (
    <Box paddingX={1}>
      <Text dimColor>{STAR_ICONS.outline} {message}</Text>
    </Box>
  );
}
