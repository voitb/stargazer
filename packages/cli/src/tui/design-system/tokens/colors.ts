/**
 * Stargazer CLI Design System - Enhanced Color Tokens
 *
 * Builds on existing palettes to add semantic surface, text, and border colors.
 * Theme-aware colors that adapt to dark/light terminal backgrounds.
 *
 * @example
 * ```typescript
 * import { colors, getThemeColors } from './colors.js';
 *
 * const themeColors = getThemeColors('dark');
 * <Text color={themeColors.text.primary}>Content</Text>
 * ```
 */

// Re-export existing palettes
export {
  PALETTES,
  THEMES,
  DEFAULT_PALETTE,
  STAR_ICONS,
  STELLAR,
  MOONLIGHT,
  DAYLIGHT,
  DUSK,
  type Palette,
  type PaletteName,
  type ThemeName,
  type RGB,
} from '../palettes.js';

// Import for internal use (brand color definitions)
import { STELLAR, MOONLIGHT, DAYLIGHT, DUSK } from '../palettes.js';

/**
 * Brand colors - semantic tokens for primary branding
 *
 * These replace brittle array index access like `STELLAR.colors[2]`
 * with meaningful names that are theme-aware.
 *
 * @example
 * ```typescript
 * import { brandColors, getThemeColors } from './colors.js';
 *
 * // Direct access:
 * const color = brandColors.dark.primary; // '#7dd3fc'
 *
 * // Via theme context (preferred):
 * const { colors } = useTheme();
 * <Text color={colors.brand.primary}>Stargazer</Text>
 * ```
 */
export const brandColors = {
  dark: {
    /** Primary brand color - stellar cyan */
    primary: STELLAR.colors[2],     // #7dd3fc - cool cyan
    /** Light brand color - stellar white-blue */
    light: STELLAR.colors[0],       // #f0f9ff - white hot
    /** Secondary brand - moonlight slate */
    secondary: MOONLIGHT.colors[0], // #94a3b8 - slate
  },
  light: {
    /** Primary brand color - daylight blue */
    primary: DAYLIGHT.colors[2],    // #3b82f6 - bright blue
    /** Light brand color - daylight navy */
    light: DAYLIGHT.colors[0],      // #1e3a5f - deep navy
    /** Secondary brand - dusk slate */
    secondary: DUSK.colors[0],      // #475569 - dark slate
  },
} as const;

/**
 * Surface colors for backgrounds and containers
 */
export const surfaceColors = {
  dark: {
    /** Transparent base - inherits terminal background */
    base: 'transparent',
    /** Elevated surfaces (cards, panels) */
    elevated: '#1e293b', // slate-800
    /** Overlay backgrounds (modals) */
    overlay: '#0f172a', // slate-900
    /** Interactive hover state */
    hover: '#334155', // slate-700
  },
  light: {
    base: 'transparent',
    elevated: '#f8fafc', // slate-50
    overlay: '#ffffff',
    hover: '#e2e8f0', // slate-200
  },
} as const;

/**
 * Text colors for content
 */
export const textColors = {
  dark: {
    /** Primary text - high contrast */
    primary: '#f8fafc', // slate-50
    /** Secondary text - slightly dimmed */
    secondary: '#94a3b8', // slate-400
    /** Muted text - hints, placeholders */
    muted: '#64748b', // slate-500
    /** Inverse text - on colored backgrounds */
    inverse: '#0f172a', // slate-900
  },
  light: {
    primary: '#0f172a', // slate-900
    secondary: '#475569', // slate-600
    muted: '#94a3b8', // slate-400
    inverse: '#f8fafc', // slate-50
  },
} as const;

/**
 * Border colors
 */
export const borderColorsMap = {
  dark: {
    /** Subtle borders for containers */
    subtle: '#334155', // slate-700
    /** Default border */
    default: '#475569', // slate-600
    /** Focus/active state */
    focus: '#38bdf8', // sky-400
    /** Error state */
    error: '#f87171', // red-400
    /** Success state */
    success: '#4ade80', // green-400
    /** Warning state */
    warning: '#fbbf24', // amber-400
  },
  light: {
    subtle: '#e2e8f0', // slate-200
    default: '#cbd5e1', // slate-300
    focus: '#0ea5e9', // sky-500
    error: '#ef4444', // red-500
    success: '#22c55e', // green-500
    warning: '#f59e0b', // amber-500
  },
} as const;

/**
 * Semantic status colors (same for both themes)
 */
export const statusColors = {
  info: {
    text: '#38bdf8', // sky-400
    bg: '#0c4a6e', // sky-900
  },
  success: {
    text: '#4ade80', // green-400
    bg: '#14532d', // green-900
  },
  warning: {
    text: '#fbbf24', // amber-400
    bg: '#78350f', // amber-900
  },
  error: {
    text: '#f87171', // red-400
    bg: '#7f1d1d', // red-900
  },
} as const;

export type StatusType = keyof typeof statusColors;

/**
 * Role colors for chat messages
 * Maps message roles to their semantic colors (theme-aware)
 *
 * @example
 * ```typescript
 * import { ROLE_COLORS } from './colors.js';
 * const color = ROLE_COLORS.user.dark; // '#38bdf8'
 * ```
 */
export const ROLE_COLORS = {
  user: {
    dark: '#38bdf8', // sky-400 - info/stellar brand
    light: '#0ea5e9', // sky-500
  },
  assistant: {
    dark: '#4ade80', // green-400 - success
    light: '#22c55e', // green-500
  },
  system: {
    dark: '#fbbf24', // amber-400 - warning
    light: '#f59e0b', // amber-500
  },
} as const;

export type MessageRole = keyof typeof ROLE_COLORS;

/**
 * Get role color for current theme
 */
export function getRoleColor(role: MessageRole, theme: 'dark' | 'light'): string {
  return ROLE_COLORS[role][theme];
}

/**
 * Combined colors object
 */
export const colors = {
  surface: surfaceColors,
  text: textColors,
  border: borderColorsMap,
  status: statusColors,
} as const;

/**
 * Get theme-specific colors
 */
export interface ThemeColors {
  surface: (typeof surfaceColors)['dark'] | (typeof surfaceColors)['light'];
  text: (typeof textColors)['dark'] | (typeof textColors)['light'];
  border: (typeof borderColorsMap)['dark'] | (typeof borderColorsMap)['light'];
  brand: (typeof brandColors)['dark'] | (typeof brandColors)['light'];
  status: typeof statusColors;
}

export function getThemeColors(theme: 'dark' | 'light'): ThemeColors {
  return {
    surface: surfaceColors[theme],
    text: textColors[theme],
    border: borderColorsMap[theme],
    brand: brandColors[theme],
    status: statusColors,
  };
}
