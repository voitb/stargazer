/**
 * Stargazer CLI Design System - Design Tokens
 *
 * Central export for all design tokens.
 *
 * @example
 * ```typescript
 * import { tokens, spacing, colors } from './tokens/index.js';
 *
 * // Use individual tokens
 * <Box padding={spacing.md} />
 *
 * // Or combined tokens object
 * <Box padding={tokens.spacing.md} />
 * ```
 */

// ═══════════════════════════════════════════════════════════════
// SPACING
// ═══════════════════════════════════════════════════════════════

export {
  spacing,
  spacingDefaults,
  getSpacing,
  type SpacingToken,
  type SpacingValue,
} from './spacing.js';

// ═══════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════

export {
  typography,
  getTypography,
  type TypographyStyle,
  type TypographyToken,
} from './typography.js';

// ═══════════════════════════════════════════════════════════════
// BORDERS
// ═══════════════════════════════════════════════════════════════

export {
  borderStyles,
  borderColors,
  borderPresets,
  dividerChars,
  createDivider,
  type BorderStyle,
  type BorderColor,
} from './borders.js';

// ═══════════════════════════════════════════════════════════════
// LAYERS
// ═══════════════════════════════════════════════════════════════

export {
  layers,
  getLayer,
  isAbove,
  sortByLayer,
  type LayerToken,
  type LayerValue,
} from './layers.js';

// ═══════════════════════════════════════════════════════════════
// MOTION
// ═══════════════════════════════════════════════════════════════

export {
  motion,
  duration,
  easing,
  spinnerConfig,
  typewriterConfig,
  pulseConfig,
  getSpinnerFrames,
  type DurationToken,
  type DurationValue,
  type EasingToken,
  type SpinnerType,
} from './motion.js';

// ═══════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════

export {
  colors,
  surfaceColors,
  textColors,
  borderColorsMap,
  statusColors,
  getThemeColors,
  ROLE_COLORS,
  getRoleColor,
  type ThemeColors,
  type StatusType,
  type MessageRole,
  // Re-exports from palettes
  PALETTES,
  THEMES,
  DEFAULT_PALETTE,
  STAR_ICONS,
  type Palette,
  type PaletteName,
  type ThemeName,
  type RGB,
} from './colors.js';

// ═══════════════════════════════════════════════════════════════
// COMBINED TOKENS
// ═══════════════════════════════════════════════════════════════

import { spacing } from './spacing.js';
import { typography } from './typography.js';
import { borderStyles, borderColors } from './borders.js';
import { layers } from './layers.js';
import { motion } from './motion.js';
import { colors, PALETTES, STAR_ICONS, ROLE_COLORS } from './colors.js';

/**
 * Combined tokens object for convenient access
 */
export const tokens = {
  spacing,
  typography,
  borders: {
    styles: borderStyles,
    colors: borderColors,
  },
  layers,
  motion,
  colors,
  roleColors: ROLE_COLORS,
  palettes: PALETTES,
  icons: STAR_ICONS,
} as const;

export type Tokens = typeof tokens;
