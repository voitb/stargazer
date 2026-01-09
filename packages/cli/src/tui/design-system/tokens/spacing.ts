/**
 * Stargazer CLI Design System - Spacing Tokens
 *
 * Consistent spacing scale for terminal layouts.
 * Values represent character counts (terminal cells).
 *
 * Apple/Stripe philosophy: generous whitespace, don't crowd elements.
 *
 * @example
 * ```typescript
 * import { spacing } from './spacing.js';
 *
 * <Box padding={spacing.md} gap={spacing.sm}>
 *   <Text>Content</Text>
 * </Box>
 * ```
 */

/**
 * Spacing scale in character units
 *
 * | Token | Chars | Use Case |
 * |-------|-------|----------|
 * | xs    | 1     | Tight gaps, inline elements |
 * | sm    | 2     | Between related elements |
 * | md    | 4     | Standard padding, gaps |
 * | lg    | 8     | Section separation |
 * | xl    | 16    | Major section breaks |
 */
export const spacing = {
  /** 1 character - tight gaps */
  xs: 1,
  /** 2 characters - inline elements */
  sm: 2,
  /** 4 characters - standard padding */
  md: 4,
  /** 8 characters - section gaps */
  lg: 8,
  /** 16 characters - major sections */
  xl: 16,
} as const;

export type SpacingToken = keyof typeof spacing;
export type SpacingValue = (typeof spacing)[SpacingToken];

/**
 * Get spacing value by token name
 */
export function getSpacing(token: SpacingToken): SpacingValue {
  return spacing[token];
}

/**
 * Default spacing for common use cases
 */
export const spacingDefaults = {
  /** Default component padding */
  componentPadding: spacing.md,
  /** Default gap between items */
  itemGap: spacing.sm,
  /** Default section margin */
  sectionMargin: spacing.lg,
} as const;
