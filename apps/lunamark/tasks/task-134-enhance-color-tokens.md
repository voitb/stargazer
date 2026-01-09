---
id: task-134
title: Enhance color tokens with surface and text colors
status: pending
priority: high
labels:
  - cli
  - design-system
  - tokens
  - colors
created: '2025-01-09'
order: 134
assignee: glm
depends_on:
  - task-129
---

## Description

Enhance the existing palette system with surface and text color tokens.
Builds on existing `palettes.ts` to add semantic surface and text colors.

## Reference

See: `packages/cli/CLI_DESIGN_SYSTEM.md` - Color System section
Existing: `packages/cli/src/tui/design-system/palettes.ts`

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/design-system/tokens/colors.ts`
- [ ] Define surface colors (base, elevated, overlay)
- [ ] Define text colors (primary, secondary, muted, inverse)
- [ ] Define border colors (subtle, default, focus, error, success)
- [ ] Import and re-export existing palettes
- [ ] Add theme-aware color resolution

## Implementation

**File**: `packages/cli/src/tui/design-system/tokens/colors.ts`

```typescript
/**
 * Stargazer CLI Design System - Enhanced Color Tokens
 *
 * Builds on existing palettes to add semantic surface, text, and border colors.
 * Theme-aware colors that adapt to dark/light terminal backgrounds.
 *
 * @example
 * ```typescript
 * import { colors, getThemeColors } from './colors.js';
 *
 * const themeColors = getThemeColors('dark');
 * <Text color={themeColors.text.primary}>Content</Text>
 * ```
 */

// Re-export existing palettes
export {
  PALETTES,
  THEMES,
  DEFAULT_PALETTE,
  STAR_ICONS,
  type Palette,
  type PaletteName,
  type ThemeName,
  type RGB,
} from '../palettes.js';

/**
 * Surface colors for backgrounds and containers
 */
export const surfaceColors = {
  dark: {
    /** Transparent base - inherits terminal background */
    base: 'transparent',
    /** Elevated surfaces (cards, panels) */
    elevated: '#1e293b', // slate-800
    /** Overlay backgrounds (modals) */
    overlay: '#0f172a', // slate-900
    /** Interactive hover state */
    hover: '#334155', // slate-700
  },
  light: {
    base: 'transparent',
    elevated: '#f8fafc', // slate-50
    overlay: '#ffffff',
    hover: '#e2e8f0', // slate-200
  },
} as const;

/**
 * Text colors for content
 */
export const textColors = {
  dark: {
    /** Primary text - high contrast */
    primary: '#f8fafc', // slate-50
    /** Secondary text - slightly dimmed */
    secondary: '#94a3b8', // slate-400
    /** Muted text - hints, placeholders */
    muted: '#64748b', // slate-500
    /** Inverse text - on colored backgrounds */
    inverse: '#0f172a', // slate-900
  },
  light: {
    primary: '#0f172a', // slate-900
    secondary: '#475569', // slate-600
    muted: '#94a3b8', // slate-400
    inverse: '#f8fafc', // slate-50
  },
} as const;

/**
 * Border colors
 */
export const borderColorsMap = {
  dark: {
    /** Subtle borders for containers */
    subtle: '#334155', // slate-700
    /** Default border */
    default: '#475569', // slate-600
    /** Focus/active state */
    focus: '#38bdf8', // sky-400
    /** Error state */
    error: '#f87171', // red-400
    /** Success state */
    success: '#4ade80', // green-400
    /** Warning state */
    warning: '#fbbf24', // amber-400
  },
  light: {
    subtle: '#e2e8f0', // slate-200
    default: '#cbd5e1', // slate-300
    focus: '#0ea5e9', // sky-500
    error: '#ef4444', // red-500
    success: '#22c55e', // green-500
    warning: '#f59e0b', // amber-500
  },
} as const;

/**
 * Semantic status colors (same for both themes)
 */
export const statusColors = {
  info: {
    text: '#38bdf8', // sky-400
    bg: '#0c4a6e', // sky-900
  },
  success: {
    text: '#4ade80', // green-400
    bg: '#14532d', // green-900
  },
  warning: {
    text: '#fbbf24', // amber-400
    bg: '#78350f', // amber-900
  },
  error: {
    text: '#f87171', // red-400
    bg: '#7f1d1d', // red-900
  },
} as const;

export type StatusType = keyof typeof statusColors;

/**
 * Combined colors object
 */
export const colors = {
  surface: surfaceColors,
  text: textColors,
  border: borderColorsMap,
  status: statusColors,
} as const;

/**
 * Get theme-specific colors
 */
export interface ThemeColors {
  surface: typeof surfaceColors.dark;
  text: typeof textColors.dark;
  border: typeof borderColorsMap.dark;
  status: typeof statusColors;
}

export function getThemeColors(theme: 'dark' | 'light'): ThemeColors {
  return {
    surface: surfaceColors[theme],
    text: textColors[theme],
    border: borderColorsMap[theme],
    status: statusColors,
  };
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```

## Usage Example

```typescript
import { Text, Box } from 'ink';
import { getThemeColors } from '../design-system/tokens/colors.js';

function ThemedCard({ theme, children }) {
  const colors = getThemeColors(theme);

  return (
    <Box borderColor={colors.border.subtle}>
      <Text color={colors.text.primary}>{children}</Text>
    </Box>
  );
}
```
