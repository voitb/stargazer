/**
 * Theme Type Definitions
 */

import type { ColorAliasTokens } from "../alias/colors";
import type { TypographyAliasTokens } from "../alias/typography";

// Full theme type combining all alias tokens
export type Theme = ColorAliasTokens & TypographyAliasTokens;

// Theme name type
export type ThemeName = "light" | "dark" | "system";

// Theme mode (resolved from system preference)
export type ThemeMode = "light" | "dark";

// Glass effect configuration
export type GlassConfig = {
  blur: string;
  saturation: string;
  backgroundOpacity: string;
};

// Theme configuration including special effects
export type ThemeConfig = {
  name: ThemeName;
  tokens: ColorAliasTokens;
  typography: TypographyAliasTokens;
  glass: GlassConfig;
};
