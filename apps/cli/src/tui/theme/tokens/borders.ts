/**
 * Stargazer CLI Design System - Border Tokens
 *
 * Border styles and divider patterns for terminal interfaces.
 * Includes star-themed patterns unique to Stargazer branding.
 *
 * @example
 * ```typescript
 * import { borders, createDivider } from './borders.js';
 *
 * <Box borderStyle={borders.style.round}>
 *   Content
 * </Box>
 *
 * console.log(createDivider('star', 40));
 * // ✦────────────────────────────────────✦
 * ```
 */

import type { BoxProps } from 'ink';

/**
 * Box border styles compatible with Ink
 *
 * | Style  | Characters | Visual |
 * |--------|------------|--------|
 * | single | ─│┌┐└┘    | Standard box |
 * | double | ═║╔╗╚╝    | Emphasized |
 * | round  | ─│╭╮╰╯    | Soft corners |
 * | bold   | ━┃┏┓┗┛    | Heavy weight |
 * | classic| +--+      | ASCII fallback |
 */
export const borderStyles = {
  single: 'single',
  double: 'double',
  round: 'round',
  bold: 'bold',
  classic: 'classic',
} as const satisfies Record<string, NonNullable<BoxProps['borderStyle']>>;

export type BorderStyle = keyof typeof borderStyles;

/**
 * Divider characters
 */
export const dividerChars = {
  /** Standard line */
  line: '─',
  /** Star endpoints */
  starStart: '✦',
  starEnd: '✦',
  /** Dot pattern */
  dot: '·',
  /** Diamond pattern */
  diamond: '◇',
} as const;

/**
 * Create a divider string of specified width
 *
 * @param variant - Divider style variant
 * @param width - Total width in characters
 * @returns Formatted divider string
 *
 * @example
 * createDivider('star', 40)
 * // ✦────────────────────────────────────✦
 *
 * createDivider('dots', 20)
 * // ····················
 */
export function createDivider(
  variant: 'line' | 'star' | 'dots' | 'diamond',
  width: number
): string {
  if (width < 3) return '';

  switch (variant) {
    case 'star': {
      const innerWidth = width - 2; // Account for star endpoints
      const line = dividerChars.line.repeat(Math.max(0, innerWidth));
      return `${dividerChars.starStart}${line}${dividerChars.starEnd}`;
    }

    case 'diamond': {
      const innerWidth = width - 2;
      const line = dividerChars.line.repeat(Math.max(0, innerWidth));
      return `${dividerChars.diamond}${line}${dividerChars.diamond}`;
    }

    case 'dots': {
      return dividerChars.dot.repeat(width);
    }

    case 'line':
    default: {
      return dividerChars.line.repeat(width);
    }
  }
}

/**
 * Border color tokens
 */
export const borderColors = {
  /** Subtle border for cards, panels */
  subtle: 'gray',
  /** Default border */
  default: 'white',
  /** Focus/active border */
  focus: 'cyan',
  /** Error state border */
  error: 'red',
  /** Success state border */
  success: 'green',
} as const;

export type BorderColor = keyof typeof borderColors;

/**
 * Predefined border configurations
 */
export const borderPresets = {
  /** Standard card border */
  card: {
    borderStyle: borderStyles.round,
    borderColor: borderColors.subtle,
  },
  /** Emphasized panel */
  panel: {
    borderStyle: borderStyles.single,
    borderColor: borderColors.default,
  },
  /** Focus state */
  focused: {
    borderStyle: borderStyles.round,
    borderColor: borderColors.focus,
  },
} as const;
