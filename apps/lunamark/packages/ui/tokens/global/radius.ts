/**
 * Global Radius Tokens (Layer 1)
 * Border radius scale for consistent rounded corners
 */

export const radiusScale = {
  none: "0",
  xs: "2px",
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  xxl: "16px",
  xxxl: "24px",
  full: "9999px",
} as const;

// Component-specific radius aliases
export const componentRadius = {
  // Interactive elements
  button: "6px",
  input: "6px",
  checkbox: "4px",
  toggle: "9999px",

  // Containers
  card: "8px",
  dialog: "12px",
  popover: "8px",
  tooltip: "4px",

  // Badges and tags
  badge: "4px",
  tag: "4px",
  chip: "9999px",

  // Media
  avatar: "9999px",
  avatarSquare: "8px",
} as const;

export type RadiusKey = keyof typeof radiusScale;
export type ComponentRadiusKey = keyof typeof componentRadius;
