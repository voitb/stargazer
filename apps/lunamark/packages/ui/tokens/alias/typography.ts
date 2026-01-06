/**
 * Alias Typography Tokens (Layer 2)
 * Semantic typography presets for consistent text styling
 */


// Typography preset type
export type TypographyPreset = {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing?: string;
};

// Semantic typography presets
export type TypographyAliasTokens = {
  // Captions (small, supplementary text)
  typeCaption2: TypographyPreset;
  typeCaption2Strong: TypographyPreset;
  typeCaption1: TypographyPreset;
  typeCaption1Strong: TypographyPreset;

  // Body text
  typeBody2: TypographyPreset;
  typeBody2Strong: TypographyPreset;
  typeBody1: TypographyPreset;
  typeBody1Strong: TypographyPreset;

  // Subtitles
  typeSubtitle2: TypographyPreset;
  typeSubtitle2Strong: TypographyPreset;
  typeSubtitle1: TypographyPreset;
  typeSubtitle1Strong: TypographyPreset;

  // Titles
  typeTitle3: TypographyPreset;
  typeTitle2: TypographyPreset;
  typeTitle1: TypographyPreset;

  // Large titles
  typeLargeTitle: TypographyPreset;

  // Display (hero text)
  typeDisplay3: TypographyPreset;
  typeDisplay2: TypographyPreset;
  typeDisplay1: TypographyPreset;
  typeHero: TypographyPreset;
};

// Usage mapping for components
export const typographyUsage = {
  // Form elements
  label: "typeBody1Strong" as keyof TypographyAliasTokens,
  input: "typeBody1" as keyof TypographyAliasTokens,
  placeholder: "typeBody1" as keyof TypographyAliasTokens,
  helperText: "typeCaption1" as keyof TypographyAliasTokens,
  errorText: "typeCaption1Strong" as keyof TypographyAliasTokens,

  // Buttons
  buttonSmall: "typeCaption1Strong" as keyof TypographyAliasTokens,
  buttonMedium: "typeBody1Strong" as keyof TypographyAliasTokens,
  buttonLarge: "typeSubtitle2Strong" as keyof TypographyAliasTokens,

  // Cards
  cardTitle: "typeSubtitle1Strong" as keyof TypographyAliasTokens,
  cardDescription: "typeBody1" as keyof TypographyAliasTokens,

  // Dialogs
  dialogTitle: "typeTitle3" as keyof TypographyAliasTokens,
  dialogDescription: "typeBody1" as keyof TypographyAliasTokens,

  // Badges
  badge: "typeCaption1Strong" as keyof TypographyAliasTokens,
  badgeSmall: "typeCaption2Strong" as keyof TypographyAliasTokens,

  // Tooltips
  tooltip: "typeCaption1" as keyof TypographyAliasTokens,
} as const;
