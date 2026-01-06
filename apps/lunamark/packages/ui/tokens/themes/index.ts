/**
 * Theme Index
 * Exports all theme configurations
 */

export * from "./types";
export * from "./light";
export * from "./dark";

import { lightColorTokens, lightTypographyTokens, lightGlassConfig } from "./light";
import { darkColorTokens, darkTypographyTokens, darkGlassConfig } from "./dark";
import type { ThemeConfig } from "./types";

export const lightTheme: ThemeConfig = {
  name: "light",
  tokens: lightColorTokens,
  typography: lightTypographyTokens,
  glass: lightGlassConfig,
};

export const darkTheme: ThemeConfig = {
  name: "dark",
  tokens: darkColorTokens,
  typography: darkTypographyTokens,
  glass: darkGlassConfig,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;
