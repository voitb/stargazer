/**
 * Global Color Tokens (Layer 1)
 * Raw color values in RGB space format for flexible opacity
 * These are never used directly - alias tokens provide semantic meaning
 */

// Neutral palette (zinc-based for deep dark aesthetic)
export const neutralPalette = {
  neutral0: "255 255 255",    // white
  neutral5: "250 250 250",    // zinc-50
  neutral10: "244 244 245",   // zinc-100
  neutral15: "243 244 246",   // gray-100 (existing bg-tertiary)
  neutral20: "228 228 231",   // zinc-200
  neutral25: "249 250 251",   // gray-50 (existing bg-secondary)
  neutral30: "212 212 216",   // zinc-300
  neutral40: "161 161 170",   // zinc-400
  neutral50: "113 113 122",   // zinc-500
  neutral60: "82 82 91",      // zinc-600
  neutral70: "63 63 70",      // zinc-700
  neutral80: "39 39 42",      // zinc-800
  neutral85: "24 24 27",      // zinc-900
  neutral90: "18 18 21",      // zinc-925
  neutral95: "17 24 39",      // gray-900 (existing fg)
  neutral100: "9 9 11",       // zinc-950
} as const;

// Brand palette (blue-based)
export const brandPalette = {
  brand10: "239 246 255",     // blue-50
  brand20: "219 234 254",     // blue-100
  brand30: "191 219 254",     // blue-200
  brand40: "147 197 253",     // blue-300
  brand50: "96 165 250",      // blue-400
  brand60: "59 130 246",      // blue-500
  brand70: "37 99 235",       // blue-600 (existing primary)
  brand80: "29 78 216",       // blue-700
  brand90: "30 64 175",       // blue-800
  brand100: "30 58 138",      // blue-900
} as const;

// Status palette
export const statusPalette = {
  // Success (green)
  success10: "240 253 244",   // green-50
  success20: "220 252 231",   // green-100
  success50: "34 197 94",     // green-500
  success60: "22 163 74",     // green-600 (existing)
  success70: "21 128 61",     // green-700

  // Warning (yellow/amber)
  warning10: "254 252 232",   // yellow-50
  warning20: "254 249 195",   // yellow-100
  warning50: "234 179 8",     // yellow-500 (existing)
  warning60: "202 138 4",     // yellow-600
  warning70: "161 98 7",      // yellow-700

  // Danger (red)
  danger10: "254 242 242",    // red-50
  danger20: "254 226 226",    // red-100
  danger40: "248 113 113",    // red-400
  danger50: "239 68 68",      // red-500
  danger60: "220 38 38",      // red-600 (existing)
  danger70: "185 28 28",      // red-700

  // Info (blue - same as brand)
  info50: "59 130 246",       // blue-500
  info60: "37 99 235",        // blue-600
} as const;

// Accent palette (purple for special effects)
export const accentPalette = {
  accent40: "167 139 250",    // violet-400
  accent50: "139 92 246",     // violet-500
  accent60: "124 58 237",     // violet-600
} as const;

export type NeutralPaletteKey = keyof typeof neutralPalette;
export type BrandPaletteKey = keyof typeof brandPalette;
export type StatusPaletteKey = keyof typeof statusPalette;
export type AccentPaletteKey = keyof typeof accentPalette;
