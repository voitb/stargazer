/**
 * Alias Color Tokens (Layer 2)
 * Semantic naming - function immediately recognizable
 * These tokens are what components actually use
 */

// Token type definition
export type ColorAliasTokens = {
  // Backgrounds (progressive layering)
  colorNeutralBackground1: string;          // Page background
  colorNeutralBackground1Hover: string;
  colorNeutralBackground1Pressed: string;
  colorNeutralBackground2: string;          // Card/elevated surface
  colorNeutralBackground2Hover: string;
  colorNeutralBackground3: string;          // Input/control background
  colorNeutralBackground3Hover: string;
  colorNeutralBackgroundDisabled: string;
  colorNeutralBackgroundInverted: string;

  // Foregrounds
  colorNeutralForeground1: string;          // Primary text
  colorNeutralForeground2: string;          // Secondary/muted text
  colorNeutralForeground3: string;          // Tertiary/placeholder
  colorNeutralForegroundDisabled: string;
  colorNeutralForegroundInverted: string;

  // Brand
  colorBrandBackground: string;
  colorBrandBackgroundHover: string;
  colorBrandBackgroundPressed: string;
  colorBrandBackgroundSelected: string;
  colorBrandForeground1: string;            // Brand color as text
  colorBrandForeground2: string;            // Lighter brand text
  colorBrandForegroundOnBrand: string;      // Text on brand background

  // Status - Success
  colorStatusSuccess: string;
  colorStatusSuccessForeground: string;
  colorStatusSuccessBackground: string;
  colorStatusSuccessBackgroundHover: string;

  // Status - Warning
  colorStatusWarning: string;
  colorStatusWarningForeground: string;
  colorStatusWarningBackground: string;
  colorStatusWarningBackgroundHover: string;

  // Status - Danger
  colorStatusDanger: string;
  colorStatusDangerForeground: string;
  colorStatusDangerBackground: string;
  colorStatusDangerBackgroundHover: string;

  // Stroke/Border
  colorNeutralStroke1: string;              // Default border
  colorNeutralStroke1Hover: string;
  colorNeutralStroke1Pressed: string;
  colorNeutralStroke2: string;              // Subtle border
  colorNeutralStrokeDisabled: string;
  colorNeutralStrokeFocus: string;          // Focus ring
  colorBrandStroke1: string;                // Brand colored border
  colorBrandStroke2: string;

  // Overlay/Shadow
  colorOverlay: string;                     // Modal backdrop
  colorShadowAmbient: string;
  colorShadowKey: string;

  // Glass effect (Lunamark signature style)
  colorGlassBackground: string;
  colorGlassBackgroundHover: string;
  colorGlassBorder: string;

  // Glow effects
  colorGlowPrimary: string;
  colorGlowAccent: string;
};

// CSS variable names (for generating tokens.css)
export const colorTokenNames: Record<keyof ColorAliasTokens, string> = {
  // Backgrounds
  colorNeutralBackground1: "--color-neutral-background-1",
  colorNeutralBackground1Hover: "--color-neutral-background-1-hover",
  colorNeutralBackground1Pressed: "--color-neutral-background-1-pressed",
  colorNeutralBackground2: "--color-neutral-background-2",
  colorNeutralBackground2Hover: "--color-neutral-background-2-hover",
  colorNeutralBackground3: "--color-neutral-background-3",
  colorNeutralBackground3Hover: "--color-neutral-background-3-hover",
  colorNeutralBackgroundDisabled: "--color-neutral-background-disabled",
  colorNeutralBackgroundInverted: "--color-neutral-background-inverted",

  // Foregrounds
  colorNeutralForeground1: "--color-neutral-foreground-1",
  colorNeutralForeground2: "--color-neutral-foreground-2",
  colorNeutralForeground3: "--color-neutral-foreground-3",
  colorNeutralForegroundDisabled: "--color-neutral-foreground-disabled",
  colorNeutralForegroundInverted: "--color-neutral-foreground-inverted",

  // Brand
  colorBrandBackground: "--color-brand-background",
  colorBrandBackgroundHover: "--color-brand-background-hover",
  colorBrandBackgroundPressed: "--color-brand-background-pressed",
  colorBrandBackgroundSelected: "--color-brand-background-selected",
  colorBrandForeground1: "--color-brand-foreground-1",
  colorBrandForeground2: "--color-brand-foreground-2",
  colorBrandForegroundOnBrand: "--color-brand-foreground-on-brand",

  // Status - Success
  colorStatusSuccess: "--color-status-success",
  colorStatusSuccessForeground: "--color-status-success-foreground",
  colorStatusSuccessBackground: "--color-status-success-background",
  colorStatusSuccessBackgroundHover: "--color-status-success-background-hover",

  // Status - Warning
  colorStatusWarning: "--color-status-warning",
  colorStatusWarningForeground: "--color-status-warning-foreground",
  colorStatusWarningBackground: "--color-status-warning-background",
  colorStatusWarningBackgroundHover: "--color-status-warning-background-hover",

  // Status - Danger
  colorStatusDanger: "--color-status-danger",
  colorStatusDangerForeground: "--color-status-danger-foreground",
  colorStatusDangerBackground: "--color-status-danger-background",
  colorStatusDangerBackgroundHover: "--color-status-danger-background-hover",

  // Strokes
  colorNeutralStroke1: "--color-neutral-stroke-1",
  colorNeutralStroke1Hover: "--color-neutral-stroke-1-hover",
  colorNeutralStroke1Pressed: "--color-neutral-stroke-1-pressed",
  colorNeutralStroke2: "--color-neutral-stroke-2",
  colorNeutralStrokeDisabled: "--color-neutral-stroke-disabled",
  colorNeutralStrokeFocus: "--color-neutral-stroke-focus",
  colorBrandStroke1: "--color-brand-stroke-1",
  colorBrandStroke2: "--color-brand-stroke-2",

  // Overlay/Shadow
  colorOverlay: "--color-overlay",
  colorShadowAmbient: "--color-shadow-ambient",
  colorShadowKey: "--color-shadow-key",

  // Glass
  colorGlassBackground: "--color-glass-background",
  colorGlassBackgroundHover: "--color-glass-background-hover",
  colorGlassBorder: "--color-glass-border",

  // Glow
  colorGlowPrimary: "--color-glow-primary",
  colorGlowAccent: "--color-glow-accent",
};
