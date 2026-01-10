/**
 * Stargazer CLI Design System - ProgressBar Component
 *
 * Premium progress bar with gradient fill using brand colors.
 */

import { Box, Text } from 'ink';
import { gradientLine } from '../gradient.js';
import { type PaletteName } from '../palettes.js';
import { useTheme } from '../primitives/theme-provider.js';
import { formatTokenCount } from '../../utils/token-counter.js';

export interface ProgressBarProps {
  /** Current value */
  current: number;
  /** Maximum value */
  total: number;
  /** Width in characters (default: 20) */
  width?: number;
  /** Show current/total label (default: true) */
  showLabel?: boolean;
  /** Show percentage (default: true) */
  showPercentage?: boolean;
  /** Custom palette override */
  palette?: PaletteName;
}

/**
 * ProgressBar Component
 *
 * Displays a gradient-filled progress bar with optional labels.
 *
 * @example
 * ```tsx
 * <ProgressBar current={50} total={100} />
 * // Output: 50/100 ██████████░░░░░░░░░░ 50%
 * ```
 */
export function ProgressBar({
  current,
  total,
  width = 20,
  showLabel = true,
  showPercentage = true,
  palette,
}: ProgressBarProps) {
  const { primaryPalette } = useTheme();
  const activePalette = palette ?? primaryPalette;

  // Calculate progress
  const safeTotal = Math.max(total, 1); // Prevent division by zero
  const safeCurrent = Math.min(Math.max(current, 0), safeTotal);
  const percent = Math.round((safeCurrent / safeTotal) * 100);
  const filled = Math.round((safeCurrent / safeTotal) * width);
  const empty = width - filled;

  // Build bar segments
  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);

  return (
    <Box gap={1}>
      {showLabel && (
        <Text dimColor>
          {formatTokenCount(safeCurrent)}/{formatTokenCount(safeTotal)}
        </Text>
      )}
      <Text>{gradientLine(filledBar, { palette: activePalette })}</Text>
      <Text dimColor>{emptyBar}</Text>
      {showPercentage && <Text dimColor>{percent}%</Text>}
    </Box>
  );
}

/**
 * Compact progress bar - minimal display
 */
export function CompactProgressBar({
  current,
  total,
  width = 10,
}: Pick<ProgressBarProps, 'current' | 'total' | 'width'>) {
  return (
    <ProgressBar
      current={current}
      total={total}
      width={width}
      showLabel={false}
      showPercentage={false}
    />
  );
}

/**
 * Percentage-only progress display
 */
export function ProgressPercent({ current, total }: Pick<ProgressBarProps, 'current' | 'total'>) {
  const { primaryPalette } = useTheme();
  const percent = Math.round((current / Math.max(total, 1)) * 100);

  // Color based on progress
  const palette = percent >= 90 ? 'error' : percent >= 70 ? 'warning' : primaryPalette;

  return <Text>{gradientLine(`${percent}%`, { palette })}</Text>;
}
