/**
 * Dark Theme Token Values
 * Maps alias tokens to global palette values for dark mode
 * Deep zinc aesthetic with enhanced glows
 */

import { neutralPalette, brandPalette, statusPalette, accentPalette } from "../global/colors";
import { fontSizes, lineHeights, fontWeights } from "../global/typography";
import type { ColorAliasTokens } from "../alias/colors";
import type { TypographyAliasTokens } from "../alias/typography";
import type { GlassConfig } from "./types";

export const darkColorTokens: ColorAliasTokens = {
  // Backgrounds (progressive layering - darker to lighter)
  colorNeutralBackground1: neutralPalette.neutral100,       // zinc-950
  colorNeutralBackground1Hover: neutralPalette.neutral90,
  colorNeutralBackground1Pressed: neutralPalette.neutral85,
  colorNeutralBackground2: neutralPalette.neutral90,        // zinc-925
  colorNeutralBackground2Hover: neutralPalette.neutral85,
  colorNeutralBackground3: neutralPalette.neutral80,        // zinc-800
  colorNeutralBackground3Hover: neutralPalette.neutral70,
  colorNeutralBackgroundDisabled: neutralPalette.neutral85,
  colorNeutralBackgroundInverted: neutralPalette.neutral5,

  // Foregrounds
  colorNeutralForeground1: neutralPalette.neutral5,         // zinc-50
  colorNeutralForeground2: neutralPalette.neutral40,        // zinc-400 (existing muted)
  colorNeutralForeground3: neutralPalette.neutral50,
  colorNeutralForegroundDisabled: neutralPalette.neutral60,
  colorNeutralForegroundInverted: neutralPalette.neutral100,

  // Brand (slightly brighter in dark mode)
  colorBrandBackground: brandPalette.brand60,               // blue-500
  colorBrandBackgroundHover: brandPalette.brand50,
  colorBrandBackgroundPressed: brandPalette.brand70,
  colorBrandBackgroundSelected: brandPalette.brand90,
  colorBrandForeground1: brandPalette.brand50,              // brighter for visibility
  colorBrandForeground2: brandPalette.brand40,
  colorBrandForegroundOnBrand: neutralPalette.neutral0,

  // Status - Success (adjusted for dark mode)
  colorStatusSuccess: statusPalette.success50,
  colorStatusSuccessForeground: statusPalette.success50,
  colorStatusSuccessBackground: `${statusPalette.success60} / 0.15`,
  colorStatusSuccessBackgroundHover: `${statusPalette.success60} / 0.25`,

  // Status - Warning
  colorStatusWarning: statusPalette.warning50,
  colorStatusWarningForeground: statusPalette.warning50,
  colorStatusWarningBackground: `${statusPalette.warning50} / 0.15`,
  colorStatusWarningBackgroundHover: `${statusPalette.warning50} / 0.25`,

  // Status - Danger
  colorStatusDanger: statusPalette.danger40,
  colorStatusDangerForeground: statusPalette.danger40,
  colorStatusDangerBackground: `${statusPalette.danger60} / 0.15`,
  colorStatusDangerBackgroundHover: `${statusPalette.danger60} / 0.25`,

  // Strokes (visible in dark mode)
  colorNeutralStroke1: neutralPalette.neutral70,            // zinc-700
  colorNeutralStroke1Hover: neutralPalette.neutral60,
  colorNeutralStroke1Pressed: neutralPalette.neutral50,
  colorNeutralStroke2: neutralPalette.neutral80,
  colorNeutralStrokeDisabled: neutralPalette.neutral80,
  colorNeutralStrokeFocus: brandPalette.brand50,
  colorBrandStroke1: brandPalette.brand50,
  colorBrandStroke2: brandPalette.brand60,

  // Overlay/Shadow (stronger in dark mode)
  colorOverlay: "0 0 0",
  colorShadowAmbient: "0 0 0",
  colorShadowKey: "0 0 0",

  // Glass (dark mode - more translucent for glow effect)
  colorGlassBackground: `${neutralPalette.neutral100} / 0.75`,
  colorGlassBackgroundHover: `${neutralPalette.neutral100} / 0.85`,
  colorGlassBorder: `${neutralPalette.neutral70} / 0.5`,

  // Glow (enhanced for dark mode visibility)
  colorGlowPrimary: `${brandPalette.brand70} / 0.25`,
  colorGlowAccent: `${accentPalette.accent50} / 0.15`,
};

// Typography tokens are the same for both themes
export const darkTypographyTokens: TypographyAliasTokens = {
  // Captions
  typeCaption2: { fontSize: fontSizes.caption2, lineHeight: lineHeights.caption2, fontWeight: fontWeights.regular },
  typeCaption2Strong: { fontSize: fontSizes.caption2, lineHeight: lineHeights.caption2, fontWeight: fontWeights.semibold },
  typeCaption1: { fontSize: fontSizes.caption1, lineHeight: lineHeights.caption1, fontWeight: fontWeights.regular },
  typeCaption1Strong: { fontSize: fontSizes.caption1, lineHeight: lineHeights.caption1, fontWeight: fontWeights.semibold },

  // Body
  typeBody2: { fontSize: fontSizes.body2, lineHeight: lineHeights.body2, fontWeight: fontWeights.regular },
  typeBody2Strong: { fontSize: fontSizes.body2, lineHeight: lineHeights.body2, fontWeight: fontWeights.semibold },
  typeBody1: { fontSize: fontSizes.body1, lineHeight: lineHeights.body1, fontWeight: fontWeights.regular },
  typeBody1Strong: { fontSize: fontSizes.body1, lineHeight: lineHeights.body1, fontWeight: fontWeights.semibold },

  // Subtitles
  typeSubtitle2: { fontSize: fontSizes.subtitle2, lineHeight: lineHeights.subtitle2, fontWeight: fontWeights.regular },
  typeSubtitle2Strong: { fontSize: fontSizes.subtitle2, lineHeight: lineHeights.subtitle2, fontWeight: fontWeights.semibold },
  typeSubtitle1: { fontSize: fontSizes.subtitle1, lineHeight: lineHeights.subtitle1, fontWeight: fontWeights.regular },
  typeSubtitle1Strong: { fontSize: fontSizes.subtitle1, lineHeight: lineHeights.subtitle1, fontWeight: fontWeights.semibold },

  // Titles
  typeTitle3: { fontSize: fontSizes.title3, lineHeight: lineHeights.title3, fontWeight: fontWeights.semibold },
  typeTitle2: { fontSize: fontSizes.title2, lineHeight: lineHeights.title2, fontWeight: fontWeights.semibold },
  typeTitle1: { fontSize: fontSizes.title1, lineHeight: lineHeights.title1, fontWeight: fontWeights.semibold },

  // Large
  typeLargeTitle: { fontSize: fontSizes.largeTitle, lineHeight: lineHeights.largeTitle, fontWeight: fontWeights.bold },

  // Display
  typeDisplay3: { fontSize: fontSizes.display3, lineHeight: lineHeights.display3, fontWeight: fontWeights.bold },
  typeDisplay2: { fontSize: fontSizes.display2, lineHeight: lineHeights.display2, fontWeight: fontWeights.bold },
  typeDisplay1: { fontSize: fontSizes.display1, lineHeight: lineHeights.display1, fontWeight: fontWeights.bold },
  typeHero: { fontSize: fontSizes.hero, lineHeight: lineHeights.hero, fontWeight: fontWeights.bold },
};

export const darkGlassConfig: GlassConfig = {
  blur: "16px",
  saturation: "180%",
  backgroundOpacity: "0.75",
};
