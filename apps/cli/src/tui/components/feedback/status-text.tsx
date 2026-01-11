/**
 * Stargazer CLI Design System - Status Text Components
 *
 * Status indicators and severity displays for code review.
 */

import { Text, type TextProps } from 'ink';
import type { ReactNode } from 'react';
import { gradientLine, useTheme } from '../../theme/index.js';
import { STAR_ICONS } from '../../theme/palettes.js';
import { statusColors } from '../../theme/tokens/colors.js';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'muted';

/**
 * Theme-aware status colors hook
 * Returns colors that adapt to dark/light theme
 */
function useStatusColors() {
  const { theme } = useTheme();
  return {
    success: theme === 'dark' ? '#4ade80' : '#22c55e',
    warning: theme === 'dark' ? '#fbbf24' : '#f59e0b',
    error: theme === 'dark' ? '#f87171' : '#ef4444',
    info: theme === 'dark' ? '#38bdf8' : '#0ea5e9',
    muted: theme === 'dark' ? '#64748b' : '#94a3b8',
  };
}

const STATUS_ICONS: Record<StatusVariant, string> = {
  success: STAR_ICONS.filled, // ✦
  warning: STAR_ICONS.outline, // ✧
  error: STAR_ICONS.circle, // ○
  info: STAR_ICONS.diamond, // ◇
  muted: STAR_ICONS.emptyCircle, // ◌
};

export interface StatusTextProps extends Omit<TextProps, 'color'> {
  children: ReactNode;
  variant: StatusVariant;
  /** Show status icon prefix */
  withIcon?: boolean;
}

/**
 * Status-colored text - replaces hardcoded color="green", color="red", etc.
 */
export function StatusText({
  children,
  variant,
  withIcon = false,
  ...textProps
}: StatusTextProps) {
  const statusColorsMap = useStatusColors();
  const icon = withIcon ? `${STATUS_ICONS[variant]} ` : '';
  return (
    <Text color={statusColorsMap[variant]} {...textProps}>
      {icon}
      {children}
    </Text>
  );
}

// ═══════════════════════════════════════════════════════════════
// SEVERITY DISPLAY (for code review)
// ═══════════════════════════════════════════════════════════════

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

function useSeverityColors() {
  const { theme } = useTheme();
  return {
    critical: theme === 'dark' ? '#ef4444' : '#dc2626',
    high: theme === 'dark' ? '#f87171' : '#ef4444',
    medium: theme === 'dark' ? '#fbbf24' : '#f59e0b',
    low: theme === 'dark' ? '#38bdf8' : '#0ea5e9',
  };
}

const SEVERITY_ICONS: Record<SeverityLevel, string> = {
  critical: STAR_ICONS.filled, // ✦ (most prominent)
  high: STAR_ICONS.star, // ★
  medium: STAR_ICONS.outline, // ✧
  low: STAR_ICONS.diamond, // ◇
};

export interface SeverityTextProps {
  severity: SeverityLevel;
  /** Show full label or just icon */
  showLabel?: boolean;
  /** Use gradient styling */
  gradient?: boolean;
}

/**
 * Severity indicator for code review issues
 * Replaces the hardcoded SEVERITY_COLORS map in review-view.tsx
 */
export function SeverityText({
  severity,
  showLabel = true,
  gradient = false,
}: SeverityTextProps) {
  const icon = SEVERITY_ICONS[severity];
  const severityColorsMap = useSeverityColors();
  const color = severityColorsMap[severity];
  const label = showLabel ? ` ${severity.toUpperCase()}` : '';

  if (gradient) {
    const palette = severity === 'critical' || severity === 'high'
      ? 'error'
      : severity === 'medium'
        ? 'warning'
        : 'stellar';
    return <Text bold>{gradientLine(`${icon}${label}`, { palette })}</Text>;
  }

  return (
    <Text color={color} bold>
      {icon}
      {label}
    </Text>
  );
}

// ═══════════════════════════════════════════════════════════════
// DECISION DISPLAY (for review results)
// ═══════════════════════════════════════════════════════════════

/**
 * Decision indicators using star theme
 * Replaces emoji-based DECISION_ICONS
 */
export const DECISION_DISPLAY = {
  approve: {
    icon: STAR_ICONS.filled, // ✦
    color: statusColors.success.text,
    label: 'Approved',
  },
  request_changes: {
    icon: STAR_ICONS.circle, // ○
    color: statusColors.error.text,
    label: 'Changes Requested',
  },
  comment: {
    icon: STAR_ICONS.diamond, // ◇
    color: statusColors.info.text,
    label: 'Comment',
  },
} as const;

export type DecisionType = keyof typeof DECISION_DISPLAY;

export interface DecisionTextProps {
  decision: DecisionType;
  showLabel?: boolean;
}

/**
 * Decision indicator for review results
 */
export function DecisionText({ decision, showLabel = true }: DecisionTextProps) {
  const { icon, color, label } = DECISION_DISPLAY[decision];
  return (
    <Text color={color} bold>
      {icon}
      {showLabel && ` ${label}`}
    </Text>
  );
}
