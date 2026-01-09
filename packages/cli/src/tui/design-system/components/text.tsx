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
 * Uses stellar gradient for premium look
 */
export function ScreenTitle({
  children,
  withStar = true,
  gradient = true,
  palette = 'stellar',
}: ScreenTitleProps) {
  const prefix = withStar ? `${STAR_ICONS.filled} ` : '';
  const content = `${prefix}${children}`;

  if (gradient) {
    return <Text bold>{gradientLine(content, { palette })}</Text>;
  }

  return (
    <Text bold color="#7dd3fc">
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
 * Section header within a screen - uses moonlight palette
 */
export function SectionTitle({ children, withStar = false }: SectionTitleProps) {
  const prefix = withStar ? `${STAR_ICONS.outline} ` : '';
  return (
    <Text bold>{gradientLine(`${prefix}${children}`, { palette: 'moonlight' })}</Text>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATUS TEXT
// ═══════════════════════════════════════════════════════════════

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'muted';

const STATUS_COLORS: Record<StatusVariant, string> = {
  success: '#4ade80', // green-400
  warning: '#fbbf24', // amber-400
  error: '#f87171', // red-400
  info: '#38bdf8', // sky-400
  muted: '#64748b', // slate-500
};

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
  const icon = withIcon ? `${STATUS_ICONS[variant]} ` : '';
  return (
    <Text color={STATUS_COLORS[variant]} {...textProps}>
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
 * Secondary/label text - uses moonlight colors
 */
export function LabelText({ children, withStar = false }: LabelTextProps) {
  const prefix = withStar ? `${STAR_ICONS.outline} ` : '';
  return (
    <Text color="#94a3b8">
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
 * File path or code reference - uses info color
 */
export function CodeText({ children }: { children: ReactNode }) {
  return <Text color="#38bdf8">{children}</Text>;
}

// ═══════════════════════════════════════════════════════════════
// SEVERITY DISPLAY (for code review)
// ═══════════════════════════════════════════════════════════════

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  critical: '#ef4444', // red-500
  high: '#f87171', // red-400
  medium: '#fbbf24', // amber-400
  low: '#38bdf8', // sky-400
};

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
}

/**
 * Severity indicator for code review issues
 * Replaces the hardcoded SEVERITY_COLORS map in review-view.tsx
 */
export function SeverityText({ severity, showLabel = true }: SeverityTextProps) {
  const icon = SEVERITY_ICONS[severity];
  const color = SEVERITY_COLORS[severity];
  const label = showLabel ? ` ${severity.toUpperCase()}` : '';

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
    color: '#4ade80', // green
    label: 'Approved',
  },
  request_changes: {
    icon: STAR_ICONS.circle, // ○
    color: '#f87171', // red
    label: 'Changes Requested',
  },
  comment: {
    icon: STAR_ICONS.diamond, // ◇
    color: '#38bdf8', // blue
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
