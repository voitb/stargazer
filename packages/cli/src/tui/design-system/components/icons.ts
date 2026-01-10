/**
 * Stargazer CLI Design System - Icon Constants
 *
 * Star-themed icons for menus and UI elements.
 */

import { STAR_ICONS } from '../palettes.js';

/**
 * Star-themed menu icons for consistent navigation
 * Use these instead of emojis (🔮🤖🔑 etc.)
 */
export const MENU_ICONS = {
  // Primary actions
  review: STAR_ICONS.filled, // ✦
  discover: STAR_ICONS.outline, // ✧
  provider: STAR_ICONS.filled, // ✦
  model: STAR_ICONS.star, // ★

  // Secondary actions
  continue: STAR_ICONS.emptyStar, // ☆
  history: STAR_ICONS.diamond, // ◇
  settings: STAR_ICONS.filledDiamond, // ◈
  apiKey: STAR_ICONS.outline, // ✧

  // Utility
  help: STAR_ICONS.circle, // ○
  exit: STAR_ICONS.emptyCircle, // ◌
  timeout: STAR_ICONS.diamond, // ◇
  clear: STAR_ICONS.circle, // ○
  sessions: STAR_ICONS.diamond, // ◇
  back: '←',
} as const;
