/**
 * Global Spacing Tokens (Layer 1)
 * 4px base unit spacing scale
 */

export const spacingScale = {
  none: "0",
  xxs: "2px",      // 0.5 units
  xs: "4px",       // 1 unit
  sm: "8px",       // 2 units
  md: "12px",      // 3 units
  lg: "16px",      // 4 units
  xl: "20px",      // 5 units
  xxl: "24px",     // 6 units
  xxxl: "32px",    // 8 units
  xxxxl: "40px",   // 10 units
  xxxxxl: "48px",  // 12 units
} as const;

// Semantic spacing aliases
export const componentSpacing = {
  // Padding
  paddingXs: "4px",
  paddingSm: "8px",
  paddingMd: "12px",
  paddingLg: "16px",
  paddingXl: "20px",

  // Gaps
  gapXs: "4px",
  gapSm: "8px",
  gapMd: "12px",
  gapLg: "16px",
  gapXl: "24px",

  // Stack spacing (vertical)
  stackXs: "4px",
  stackSm: "8px",
  stackMd: "16px",
  stackLg: "24px",
  stackXl: "32px",

  // Inline spacing (horizontal)
  inlineXs: "4px",
  inlineSm: "8px",
  inlineMd: "12px",
  inlineLg: "16px",
} as const;

export type SpacingKey = keyof typeof spacingScale;
export type ComponentSpacingKey = keyof typeof componentSpacing;
