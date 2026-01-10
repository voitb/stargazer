/**
 * Stargazer CLI Design System - Label Components
 *
 * Secondary text, hints, and code reference components.
 */

import { Text } from 'ink';
import type { ReactNode } from 'react';
import { STAR_ICONS } from '../palettes.js';
import { useTheme } from '../primitives/theme-provider.js';

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
