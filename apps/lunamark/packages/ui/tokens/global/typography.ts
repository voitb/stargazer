/**
 * Global Typography Tokens (Layer 1)
 * Fluent 2-inspired 14-step type scale
 */

// Font sizes following Fluent 2 scale
export const fontSizes = {
  caption2: "10px",
  caption1: "12px",
  body2: "13px",
  body1: "14px",         // base
  subtitle2: "16px",
  subtitle1: "18px",
  title3: "20px",
  title2: "24px",
  title1: "28px",
  largeTitle: "32px",
  display3: "40px",
  display2: "48px",
  display1: "56px",
  hero: "68px",
} as const;

// Line heights (paired with font sizes)
export const lineHeights = {
  caption2: "14px",
  caption1: "16px",
  body2: "18px",
  body1: "20px",
  subtitle2: "22px",
  subtitle1: "24px",
  title3: "26px",
  title2: "30px",
  title1: "34px",
  largeTitle: "40px",
  display3: "48px",
  display2: "56px",
  display1: "64px",
  hero: "76px",
} as const;

// Font weights
export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

// Font families (system fonts for performance)
export const fontFamilies = {
  base: '-apple-system, BlinkMacSystemFont, "Segoe UI Variable", "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
} as const;

// Letter spacing
export const letterSpacings = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0",
  wide: "0.025em",
  wider: "0.05em",
} as const;

export type FontSizeKey = keyof typeof fontSizes;
export type LineHeightKey = keyof typeof lineHeights;
export type FontWeightKey = keyof typeof fontWeights;
export type FontFamilyKey = keyof typeof fontFamilies;
