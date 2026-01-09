/**
 * Stargazer CLI Design System - Theme Provider
 *
 * Provides theme context with automatic detection for dark/light terminals.
 *
 * Detection priority:
 * 1. STARGAZER_THEME env var (explicit override)
 * 2. COLORFGBG env var (terminal standard)
 * 3. Default to 'dark' (most common)
 *
 * @example
 * ```typescript
 * import { ThemeProvider, useTheme } from './theme-provider.js';
 *
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * function MyComponent() {
 *   const { theme, colors, palette } = useTheme();
 * }
 * ```
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { getThemeColors, type ThemeColors } from '../tokens/colors.js';
import { PALETTES, THEMES, type PaletteName } from '../palettes.js';

export type Theme = 'dark' | 'light';

export interface ThemeContextValue {
  /** Current theme */
  theme: Theme;
  /** Theme-specific colors */
  colors: ThemeColors;
  /** Primary palette for current theme */
  primaryPalette: PaletteName;
  /** Secondary palette for current theme */
  secondaryPalette: PaletteName;
  /** Get a palette by name */
  getPalette: (name: PaletteName) => typeof PALETTES.stellar;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Detect terminal theme from environment
 *
 * Checks:
 * 1. STARGAZER_THEME - explicit user preference
 * 2. COLORFGBG - terminal's foreground;background colors
 *    Format: "fg;bg" where high bg values = light theme
 * 3. Default to dark (most terminals are dark)
 */
export function detectTheme(): Theme {
  // 1. Check explicit override
  const explicitTheme = process.env['STARGAZER_THEME'];
  if (explicitTheme === 'light' || explicitTheme === 'dark') {
    return explicitTheme;
  }

  // 2. Check COLORFGBG (format: "fg;bg")
  const colorfgbg = process.env['COLORFGBG'];
  if (colorfgbg) {
    const parts = colorfgbg.split(';');
    if (parts.length >= 2) {
      const bgStr = parts[1];
      if (bgStr) {
        const bg = parseInt(bgStr, 10);
        // ANSI colors 0-7 are dark, 8-15 are bright
        // Higher values typically indicate light backgrounds
        if (!Number.isNaN(bg) && bg > 8) {
          return 'light';
        }
      }
    }
  }

  // 3. Default to dark
  return 'dark';
}

export interface ThemeProviderProps {
  /** Override auto-detected theme */
  theme?: Theme;
  /** Children to render */
  children: ReactNode;
}

/**
 * Theme provider component
 *
 * Wraps the app with theme context, providing theme-aware colors
 * to all descendant components.
 */
export function ThemeProvider({ theme: themeProp, children }: ThemeProviderProps) {
  const theme = themeProp ?? detectTheme();

  const value = useMemo<ThemeContextValue>(() => {
    const colors = getThemeColors(theme);
    const themeConfig = THEMES[theme];

    return {
      theme,
      colors,
      primaryPalette: themeConfig.primary as PaletteName,
      secondaryPalette: themeConfig.secondary as PaletteName,
      getPalette: (name: PaletteName) => PALETTES[name],
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 *
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { theme, colors, primaryPalette } = useTheme();
 *
 *   return (
 *     <Text color={colors.text.primary}>
 *       Current theme: {theme}
 *     </Text>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Hook to check if we're in dark or light mode
 */
export function useIsDark(): boolean {
  const { theme } = useTheme();
  return theme === 'dark';
}
