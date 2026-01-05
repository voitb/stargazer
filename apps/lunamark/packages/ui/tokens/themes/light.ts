/**
 * Light Theme Token Values
 * Maps alias tokens to global palette values for light mode
 */

import { neutralPalette, brandPalette, statusPalette, accentPalette } from "../global/colors";
import { fontSizes, lineHeights, fontWeights } from "../global/typography";
import type { ColorAliasTokens } from "../alias/colors";
import type { TypographyAliasTokens } from "../alias/typography";
import type { GlassConfig } from "./types";

export const lightColorTokens: ColorAliasTokens = {
  // Backgrounds (progressive layering - lighter to darker)
  colorNeutralBackground1: neutralPalette.neutral0,         // white
  colorNeutralBackground1Hover: neutralPalette.neutral5,
  colorNeutralBackground1Pressed: neutralPalette.neutral10,
  colorNeutralBackground2: neutralPalette.neutral25,        // gray-50
  colorNeutralBackground2Hover: neutralPalette.neutral15,
  colorNeutralBackground3: neutralPalette.neutral15,        // gray-100
  colorNeutralBackground3Hover: neutralPalette.neutral20,
  colorNeutralBackgroundDisabled: neutralPalette.neutral10,
  colorNeutralBackgroundInverted: neutralPalette.neutral95,

  // Foregrounds
  colorNeutralForeground1: neutralPalette.neutral95,        // gray-900
  colorNeutralForeground2: "107 114 128",                   // gray-500 (existing muted)
  colorNeutralForeground3: neutralPalette.neutral40,
  colorNeutralForegroundDisabled: neutralPalette.neutral30,
  colorNeutralForegroundInverted: neutralPalette.neutral0,

  // Brand
  colorBrandBackground: brandPalette.brand70,               // blue-600
  colorBrandBackgroundHover: brandPalette.brand80,
  colorBrandBackgroundPressed: brandPalette.brand90,
  colorBrandBackgroundSelected: brandPalette.brand20,
  colorBrandForeground1: brandPalette.brand70,
  colorBrandForeground2: brandPalette.brand60,
  colorBrandForegroundOnBrand: neutralPalette.neutral0,

  // Status - Success
  colorStatusSuccess: statusPalette.success60,
  colorStatusSuccessForeground: statusPalette.success70,
  colorStatusSuccessBackground: statusPalette.success10,
  colorStatusSuccessBackgroundHover: statusPalette.success20,

  // Status - Warning
  colorStatusWarning: statusPalette.warning50,
  colorStatusWarningForeground: statusPalette.warning70,
  colorStatusWarningBackground: statusPalette.warning10,
  colorStatusWarningBackgroundHover: statusPalette.warning20,

  // Status - Danger
  colorStatusDanger: statusPalette.danger60,
  colorStatusDangerForeground: statusPalette.danger70,
  colorStatusDangerBackground: statusPalette.danger10,
  colorStatusDangerBackgroundHover: statusPalette.danger20,

  // Strokes
  colorNeutralStroke1: "229 231 235",                       // gray-200 (existing)
  colorNeutralStroke1Hover: neutralPalette.neutral30,
  colorNeutralStroke1Pressed: neutralPalette.neutral40,
  colorNeutralStroke2: neutralPalette.neutral10,
  colorNeutralStrokeDisabled: neutralPalette.neutral15,
  colorNeutralStrokeFocus: brandPalette.brand60,            // blue-500
  colorBrandStroke1: brandPalette.brand70,
  colorBrandStroke2: brandPalette.brand40,

  // Overlay/Shadow
  colorOverlay: "0 0 0",
  colorShadowAmbient: "0 0 0",
  colorShadowKey: "0 0 0",

  // Glass (light mode - more opaque)
  colorGlassBackground: `${neutralPalette.neutral0} / 0.85`,
  colorGlassBackgroundHover: `${neutralPalette.neutral0} / 0.9`,
  colorGlassBorder: `${neutralPalette.neutral30} / 0.5`,

  // Glow
  colorGlowPrimary: `${brandPalette.brand70} / 0.15`,
  colorGlowAccent: `${accentPalette.accent50} / 0.12`,
};

export const lightTypographyTokens: TypographyAliasTokens = {
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

export const lightGlassConfig: GlassConfig = {
  blur: "16px",
  saturation: "180%",
  backgroundOpacity: "0.85",
};
