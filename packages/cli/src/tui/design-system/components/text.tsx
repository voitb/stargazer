/**
 * Stargazer CLI Design System - Semantic Text Components
 *
 * Provides themed text components for consistent styling across all screens.
 * Replaces hardcoded color="cyan", color="green", etc. with semantic components.
 *
 * @example
 * ```tsx
 * // Instead of:
 * <Text bold color="cyan">Settings</Text>
 *
 * // Use:
 * <ScreenTitle>Settings</ScreenTitle>
 * ```
 */

import { Text, type TextProps } from 'ink';
import type { ReactNode } from 'react';
import { gradientLine } from '../gradient.js';
import { STAR_ICONS } from '../palettes.js';
import { useTheme } from '../primitives/theme-provider.js';
import { statusColors } from '../tokens/colors.js';

// ═══════════════════════════════════════════════════════════════
// SCREEN & SECTION TITLES
// ═══════════════════════════════════════════════════════════════

export interface ScreenTitleProps {
  children: ReactNode;
  /** Add star icon prefix */
  withStar?: boolean;
  /** Use gradient styling (for premium feel) */
  gradient?: boolean;
  /** Palette for gradient: 'stellar' (dark) or 'daylight' (light) */
  palette?: 'stellar' | 'daylight' | 'moonlight';
}

/**
 * Main screen title - replaces `<Text bold color="cyan">`
 * Uses stellar/daylight gradient for premium look (theme-aware)
 */
export function ScreenTitle({
  children,
  withStar = true,
  gradient = true,
  palette = 'stellar',
}: ScreenTitleProps) {
  const { theme, colors } = useTheme();
  const prefix = withStar ? `${STAR_ICONS.filled} ` : '';
  const content = `${prefix}${children}`;

  // Use theme-aware palette for gradient
  const themePalette = palette === 'stellar'
    ? (theme === 'dark' ? 'stellar' : 'daylight')
    : palette;

  if (gradient) {
    return <Text bold>{gradientLine(content, { palette: themePalette })}</Text>;
  }

  // Theme-aware fallback color using brand tokens
  return (
    <Text bold color={colors.brand.primary}>
      {content}
    </Text>
  );
}

export interface SectionTitleProps {
  children: ReactNode;
  /** Add star icon prefix */
  withStar?: boolean;
}

/**
 * Section header within a screen - uses moonlight/dusk palette (theme-aware)
 */
export function SectionTitle({ children, withStar = false }: SectionTitleProps) {
  const { theme } = useTheme();
  const prefix = withStar ? `${STAR_ICONS.outline} ` : '';
  // Use theme-aware palette: moonlight for dark, dusk for light
  const themePalette = theme === 'dark' ? 'moonlight' : 'dusk';
  return (
    <Text bold>{gradientLine(`${prefix}${children}`, { palette: themePalette })}</Text>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATUS TEXT
// ═══════════════════════════════════════════════════════════════

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
  const statusColors = useStatusColors();
  const icon = withIcon ? `${STATUS_ICONS[variant]} ` : '';
  return (
    <Text color={statusColors[variant]} {...textProps}>
      {icon}
      {children}
    </Text>
  );
}

// ═══════════════════════════════════════════════════════════════
// LABEL & HINT TEXT
// ═══════════════════════════════════════════════════════════════

export interface LabelTextProps {
  children: ReactNode;
  /** Use star icon prefix */
  withStar?: boolean;
}

/**
 * Secondary/label text - uses theme-aware secondary color
 */
export function LabelText({ children, withStar = false }: LabelTextProps) {
  const { colors } = useTheme();
  const prefix = withStar ? `${STAR_ICONS.outline} ` : '';
  return (
    <Text color={colors.text.secondary}>
      {prefix}
      {children}
    </Text>
  );
}

/**
 * Muted hint text - dimmed for less emphasis
 */
export function HintText({ children }: { children: ReactNode }) {
  return <Text dimColor>{children}</Text>;
}

/**
 * File path or code reference - uses theme-aware border focus color (info style)
 */
export function CodeText({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text color={colors.border.focus}>{children}</Text>;
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
  const severityColors = useSeverityColors();
  const color = severityColors[severity];
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
// MENU ICONS (star-themed)
// ═══════════════════════════════════════════════════════════════

/**
 * Star-themed menu icons for consistent navigation
 * Use these instead of emojis (🔮🤖🔑 etc.)
 */
export const MENU_ICONS = {
  // Primary actions
  review: STAR_ICONS.filled, // ✦
  discover: STAR_ICONS.outline, // ✧
  provider: STAR_ICONS.filled, // ✦
  model: STAR_ICONS.star, // ★

  // Secondary actions
  continue: STAR_ICONS.emptyStar, // ☆
  history: STAR_ICONS.diamond, // ◇
  settings: STAR_ICONS.filledDiamond, // ◈
  apiKey: STAR_ICONS.outline, // ✧

  // Utility
  help: STAR_ICONS.circle, // ○
  exit: STAR_ICONS.emptyCircle, // ◌
  timeout: STAR_ICONS.diamond, // ◇
  clear: STAR_ICONS.circle, // ○
  sessions: STAR_ICONS.diamond, // ◇
  back: '←',
} as const;

// ═══════════════════════════════════════════════════════════════
// DECISION ICONS (for review results)
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
