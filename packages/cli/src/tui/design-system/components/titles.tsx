/**
 * Stargazer CLI Design System - Title Components
 *
 * Screen and section title components with gradient support.
 */

import { Text } from 'ink';
import type { ReactNode } from 'react';
import { gradientLine } from '../gradient.js';
import { STAR_ICONS } from '../palettes.js';
import { useTheme } from '../primitives/theme-provider.js';

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
