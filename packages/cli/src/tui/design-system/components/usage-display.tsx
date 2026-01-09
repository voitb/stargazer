/**
 * Stargazer CLI Design System - UsageDisplay Component
 *
 * Premium token/usage display with brand styling.
 * Shows current usage with optional progress bar.
 */

import { Box, Text } from 'ink';
import { gradientLine } from '../gradient.js';
import { useTheme } from '../primitives/theme-provider.js';
import { STAR_ICONS } from '../palettes.js';
import { ProgressBar } from './progress-bar.js';

export interface UsageDisplayProps {
  /** Current usage value */
  current: number;
  /** Maximum/limit value */
  limit: number;
  /** Label for the metric (default: 'tokens') */
  label?: string;
  /** Show progress bar (default: true) */
  showProgress?: boolean;
  /** Progress bar width (default: 24) */
  progressWidth?: number;
  /** Compact mode - single line (default: false) */
  compact?: boolean;
}

/**
 * UsageDisplay Component
 *
 * Premium display for token/usage counts with brand colors.
 * Automatically changes color based on usage percentage.
 *
 * @example
 * ```tsx
 * <UsageDisplay current={1500} limit={4000} label="tokens" />
 * // Output:
 * // ✦ 1,500 / 4,000 tokens
 * // ████████████░░░░░░░░░░░░ 38%
 * ```
 */
export function UsageDisplay({
  current,
  limit,
  label = 'tokens',
  showProgress = true,
  progressWidth = 24,
  compact = false,
}: UsageDisplayProps) {
  const { primaryPalette } = useTheme();
  const percent = Math.round((current / Math.max(limit, 1)) * 100);

  // Determine palette based on usage level
  const usagePalette = percent >= 90 ? 'error' : percent >= 70 ? 'warning' : primaryPalette;

  if (compact) {
    return (
      <Box gap={1}>
        <Text>
          {gradientLine(`${STAR_ICONS.filled} ${current.toLocaleString()}`, { palette: usagePalette })}
        </Text>
        <Text dimColor>/ {limit.toLocaleString()}</Text>
        <ProgressBar
          current={current}
          total={limit}
          width={12}
          showLabel={false}
          showPercentage={false}
          palette={usagePalette}
        />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={0}>
      <Box gap={1}>
        <Text>
          {gradientLine(`${STAR_ICONS.filled} ${current.toLocaleString()}`, { palette: usagePalette })}
        </Text>
        <Text dimColor>/ {limit.toLocaleString()} {label}</Text>
      </Box>
      {showProgress && (
        <ProgressBar
          current={current}
          total={limit}
          width={progressWidth}
          showLabel={false}
          palette={usagePalette}
        />
      )}
    </Box>
  );
}

/**
 * Token counter badge - minimal inline display
 */
export function TokenBadge({ current, limit }: Pick<UsageDisplayProps, 'current' | 'limit'>) {
  const { primaryPalette } = useTheme();
  const percent = Math.round((current / Math.max(limit, 1)) * 100);
  const palette = percent >= 90 ? 'error' : percent >= 70 ? 'warning' : primaryPalette;

  return (
    <Text>
      {gradientLine(`${STAR_ICONS.outline} ${current.toLocaleString()}`, { palette })}
    </Text>
  );
}
