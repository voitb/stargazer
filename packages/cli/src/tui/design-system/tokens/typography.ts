/**
 * Stargazer CLI Design System - Typography Tokens
 *
 * Semantic text styles for terminal interfaces.
 * Since terminals have fixed font size, we use:
 * - bold: for emphasis and hierarchy
 * - dimColor: for secondary/muted text
 * - italic: for emphasis (limited terminal support)
 *
 * @example
 * ```typescript
 * import { typography } from './typography.js';
 *
 * <Text {...typography.title}>Screen Title</Text>
 * <Text {...typography.caption}>Helper text</Text>
 * ```
 */

/**
 * Typography style object compatible with Ink's Text component
 */
export interface TypographyStyle {
  bold?: boolean;
  dimColor?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/**
 * Semantic typography styles
 *
 * | Style   | Bold | Dim | Use Case |
 * |---------|------|-----|----------|
 * | title   | Yes  | No  | Screen headers, logo |
 * | heading | Yes  | No  | Section headers |
 * | body    | No   | No  | Main content |
 * | caption | No   | Yes | Labels, hints, secondary |
 * | code    | No   | No  | Code snippets |
 * | link    | No   | No  | Interactive elements (underlined) |
 */
export const typography = {
  /** Screen headers, logo text - bold, prominent */
  title: {
    bold: true,
  } satisfies TypographyStyle,

  /** Section headers - bold */
  heading: {
    bold: true,
  } satisfies TypographyStyle,

  /** Main content - normal weight */
  body: {
    bold: false,
  } satisfies TypographyStyle,

  /** Labels, hints, secondary info - dimmed */
  caption: {
    bold: false,
    dimColor: true,
  } satisfies TypographyStyle,

  /** Code snippets - normal, monospace (terminal default) */
  code: {
    bold: false,
  } satisfies TypographyStyle,

  /** Interactive elements - underlined */
  link: {
    bold: false,
    underline: true,
  } satisfies TypographyStyle,

  /** Emphasized text - italic */
  emphasis: {
    bold: false,
    italic: true,
  } satisfies TypographyStyle,

  /** Strong emphasis - bold */
  strong: {
    bold: true,
  } satisfies TypographyStyle,
} as const;

export type TypographyToken = keyof typeof typography;

/**
 * Get typography style by token name
 */
export function getTypography(token: TypographyToken): TypographyStyle {
  return typography[token];
}
