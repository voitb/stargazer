---
id: task-147
title: Create theme detection utility
status: pending
priority: high
labels:
  - cli
  - design-system
  - utils
  - theme
created: '2025-01-09'
order: 147
assignee: glm
depends_on:
  - task-135
---

## Description

Create a standalone theme detection utility that can be used outside React context.
Extracts the detection logic from theme-provider for use in non-component code.

## Reference

See: `packages/cli/CLI_DESIGN_SYSTEM.md` - Theme Support section

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/design-system/utils/detect-theme.ts`
- [ ] Support STARGAZER_THEME env var
- [ ] Support COLORFGBG env var
- [ ] Support explicit theme override
- [ ] Export theme detection function

## Implementation

**File**: `packages/cli/src/tui/design-system/utils/detect-theme.ts`

```typescript
/**
 * Stargazer CLI Design System - Theme Detection
 *
 * Detects terminal theme (dark/light) from environment.
 * Can be used outside React context.
 *
 * Detection priority:
 * 1. Explicit override parameter
 * 2. STARGAZER_THEME env var
 * 3. COLORFGBG env var (terminal standard)
 * 4. Default to 'dark'
 *
 * @example
 * ```typescript
 * import { detectTheme, getThemeFromEnv } from './detect-theme.js';
 *
 * const theme = detectTheme(); // 'dark' | 'light'
 *
 * // With override
 * const theme = detectTheme('light'); // Forces 'light'
 * ```
 */

export type Theme = 'dark' | 'light';

/**
 * Parse COLORFGBG environment variable
 *
 * Format: "foreground;background" where values are ANSI color codes
 * - 0-7: Standard colors (dark)
 * - 8-15: Bright colors (light)
 * - Higher values may indicate light backgrounds
 *
 * @returns Detected theme or null if can't determine
 */
export function parseColorfgbg(value: string | undefined): Theme | null {
  if (!value) return null;

  const parts = value.split(';');
  if (parts.length < 2) return null;

  const bg = parseInt(parts[1], 10);
  if (isNaN(bg)) return null;

  // ANSI colors 0-7 are dark, 8-15 are bright
  // Background > 8 typically indicates light theme
  // Some terminals use values like 15 for white backgrounds
  return bg > 8 ? 'light' : 'dark';
}

/**
 * Get theme from environment variables
 *
 * Checks:
 * 1. STARGAZER_THEME - explicit user preference
 * 2. COLORFGBG - terminal standard
 *
 * @returns Theme from environment or null
 */
export function getThemeFromEnv(): Theme | null {
  // Check explicit preference first
  const explicit = process.env.STARGAZER_THEME;
  if (explicit === 'dark' || explicit === 'light') {
    return explicit;
  }

  // Check COLORFGBG
  const colorfgbg = process.env.COLORFGBG;
  const parsed = parseColorfgbg(colorfgbg);
  if (parsed) {
    return parsed;
  }

  return null;
}

/**
 * Detect current terminal theme
 *
 * @param override - Force a specific theme
 * @returns Detected or overridden theme
 */
export function detectTheme(override?: Theme): Theme {
  // Explicit override takes priority
  if (override) {
    return override;
  }

  // Try environment detection
  const envTheme = getThemeFromEnv();
  if (envTheme) {
    return envTheme;
  }

  // Default to dark (most common terminal theme)
  return 'dark';
}

/**
 * Check if running in light theme
 */
export function isLightTheme(override?: Theme): boolean {
  return detectTheme(override) === 'light';
}

/**
 * Check if running in dark theme
 */
export function isDarkTheme(override?: Theme): boolean {
  return detectTheme(override) === 'dark';
}

/**
 * Theme configuration based on detected theme
 */
export interface ThemeConfig {
  theme: Theme;
  primaryPalette: 'stellar' | 'daylight';
  secondaryPalette: 'moonlight' | 'dusk';
}

/**
 * Get theme configuration with palette mappings
 */
export function getThemeConfig(override?: Theme): ThemeConfig {
  const theme = detectTheme(override);

  if (theme === 'light') {
    return {
      theme: 'light',
      primaryPalette: 'daylight',
      secondaryPalette: 'dusk',
    };
  }

  return {
    theme: 'dark',
    primaryPalette: 'stellar',
    secondaryPalette: 'moonlight',
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
// In non-React code
import { detectTheme, getThemeConfig } from '../design-system/utils/detect-theme.js';
import { PALETTES } from '../design-system/palettes.js';

function getStartupLogo() {
  const { primaryPalette } = getThemeConfig();
  const palette = PALETTES[primaryPalette];

  return renderLogoWithColors(palette);
}

// In config initialization
const theme = detectTheme();
console.log(`Running in ${theme} mode`);
```
