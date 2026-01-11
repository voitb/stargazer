/**
 * Stargazer CLI Design System - Color Palettes
 *
 * Minimalist palette system for ASCII-style CLI interfaces.
 * Designed for both dark and light terminal themes.
 *
 * @example
 * ```typescript
 * import { PALETTES } from './palettes.js';
 * // Use stellar for dark terminals (default)
 * // Use daylight for light terminals
 * ```
 */

export type RGB = [number, number, number];

export interface Palette {
  name: string;
  colors: string[];
  rgb: RGB[];
  description: string;
}

// ═══════════════════════════════════════════════════════════════
// DARK THEME PALETTES (for dark terminal backgrounds)
// ═══════════════════════════════════════════════════════════════

/**
 * Stellar - Primary brand palette for dark terminals
 * Cool blue-white gradient evoking bright starlight
 * USE FOR: Main branding, active states, highlights
 */
export const STELLAR: Palette = {
  name: 'stellar',
  colors: ['#f0f9ff', '#bae6fd', '#7dd3fc'],
  rgb: [
    [240, 249, 255],  // White hot
    [186, 230, 253],  // Ice blue
    [125, 211, 252],  // Cool cyan
  ],
  description: 'Cool blue-white starlight',
};

/**
 * Moonlight - Secondary palette for dark terminals
 * Subtle silver-gray for muted text and labels
 * USE FOR: Secondary text, labels, dividers
 */
export const MOONLIGHT: Palette = {
  name: 'moonlight',
  colors: ['#94a3b8', '#cbd5e1', '#e2e8f0'],
  rgb: [
    [148, 163, 184],  // Slate
    [203, 213, 225],  // Silver
    [226, 232, 240],  // Light gray
  ],
  description: 'Subtle silver-gray',
};

// ═══════════════════════════════════════════════════════════════
// LIGHT THEME PALETTES (for light terminal backgrounds)
// ═══════════════════════════════════════════════════════════════

/**
 * Daylight - Primary brand palette for light terminals
 * Deep indigo-blue gradient (opposite of stellar)
 * USE FOR: Main branding on light backgrounds
 */
export const DAYLIGHT: Palette = {
  name: 'daylight',
  colors: ['#1e3a5f', '#2563eb', '#3b82f6'],
  rgb: [
    [30, 58, 95],     // Deep navy
    [37, 99, 235],    // Royal blue
    [59, 130, 246],   // Bright blue
  ],
  description: 'Deep indigo-blue for light themes',
};

/**
 * Dusk - Secondary palette for light terminals
 * Muted slate tones for secondary text
 * USE FOR: Secondary text on light backgrounds
 */
export const DUSK: Palette = {
  name: 'dusk',
  colors: ['#475569', '#64748b', '#94a3b8'],
  rgb: [
    [71, 85, 105],    // Dark slate
    [100, 116, 139],  // Slate
    [148, 163, 184],  // Light slate
  ],
  description: 'Muted slate for light themes',
};

// ═══════════════════════════════════════════════════════════════
// SEMANTIC PALETTES (work on both dark and light)
// ═══════════════════════════════════════════════════════════════

/**
 * Success - Green gradient for positive states
 * USE FOR: Success messages, completed states
 */
export const SUCCESS: Palette = {
  name: 'success',
  colors: ['#86efac', '#4ade80', '#22c55e'],
  rgb: [
    [134, 239, 172],  // Light green
    [74, 222, 128],   // Green
    [34, 197, 94],    // Dark green
  ],
  description: 'Success green',
};

/**
 * Warning - Amber gradient for warnings
 * USE FOR: Warning messages, caution states
 */
export const WARNING: Palette = {
  name: 'warning',
  colors: ['#fde68a', '#fbbf24', '#f59e0b'],
  rgb: [
    [253, 230, 138],  // Light amber
    [251, 191, 36],   // Amber
    [245, 158, 11],   // Dark amber
  ],
  description: 'Warning amber',
};

/**
 * Error - Red gradient for errors
 * USE FOR: Error messages, failed states, destructive actions
 */
export const ERROR: Palette = {
  name: 'error',
  colors: ['#fca5a5', '#f87171', '#ef4444'],
  rgb: [
    [252, 165, 165],  // Light red
    [248, 113, 113],  // Red
    [239, 68, 68],    // Dark red
  ],
  description: 'Error red',
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

/**
 * All available palettes
 */
export const PALETTES = {
  // Dark theme
  stellar: STELLAR,
  moonlight: MOONLIGHT,
  // Light theme
  daylight: DAYLIGHT,
  dusk: DUSK,
  // Semantic
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
} as const;

export type PaletteName = keyof typeof PALETTES;

/**
 * Theme-aware palette selection
 */
export const THEMES = {
  dark: {
    primary: 'stellar',
    secondary: 'moonlight',
  },
  light: {
    primary: 'daylight',
    secondary: 'dusk',
  },
} as const;

export type ThemeName = keyof typeof THEMES;

/**
 * Default palette (dark theme primary)
 */
export const DEFAULT_PALETTE: PaletteName = 'stellar';

/**
 * Star icons used throughout the UI
 */
export const STAR_ICONS = {
  filled: '✦',
  outline: '✧',
  star: '★',
  emptyStar: '☆',
  diamond: '◇',
  filledDiamond: '◈',
  circle: '○',
  emptyCircle: '◌',
} as const;
