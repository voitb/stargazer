import { Box, Text } from 'ink';
import { useTheme } from '../../theme/index.js';
import { STAR_ICONS } from '../../theme/palettes.js';
import { UsageDisplay } from '../display/usage-display.js';
import { Badge, CountBadge } from '../feedback/badge.js';

interface StatusBarProps {
  message: string;
  sessionCount?: number;
  hasApiKey?: boolean;
  /** Token usage tracking */
  tokenUsage?: {
    current: number;
    limit: number;
  };
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
export function StatusBar({ message, sessionCount, hasApiKey, tokenUsage }: StatusBarProps) {
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
        {tokenUsage && (
          <UsageDisplay
            current={tokenUsage.current}
            limit={tokenUsage.limit}
            label="tokens"
            showProgress={false}
            compact
          />
        )}
        {hasApiKey !== undefined && (
          <Badge variant={hasApiKey ? 'success' : 'error'} gradient>
            API
          </Badge>
        )}
        {sessionCount !== undefined && (
          <CountBadge count={sessionCount} variant="brand" label="sessions" />
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
