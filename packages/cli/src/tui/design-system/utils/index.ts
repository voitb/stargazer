/**
 * Stargazer CLI Design System - Utils Barrel
 */

export {
  detectTheme,
  getThemeFromEnv,
  getThemeConfig,
  isLightTheme,
  isDarkTheme,
  parseColorfgbg,
  type ThemeConfig,
  type Theme,
} from './detect-theme.js';

export {
  getTerminalSize,
  getTerminalWidth,
  getTerminalHeight,
  getBreakpoint,
  getLogoVariant,
  isAboveBreakpoint,
  DEFAULT_SIZE,
  type TerminalSize,
} from './terminal-size.js';
