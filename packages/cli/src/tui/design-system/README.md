# Stargazer CLI Design System

A minimalist design system for ASCII-style CLI interfaces. Inspired by Claude Code and Gemini CLI's signature gradient logos.

## Table of Contents

- [Quick Start](#quick-start)
- [Color Palettes](#color-palettes)
- [Gradient Functions](#gradient-functions)
- [ASCII Logo](#ascii-logo)
- [Star Icons](#star-icons)
- [Usage Examples](#usage-examples)
- [File Structure](#file-structure)

---

## Quick Start

```typescript
import {
  gradientLine,
  gradientText,
  renderLogo,
  renderCompactLogo,
  STAR_ICONS,
  PALETTES,
} from './design-system/index.js';

// Render the full logo
console.log(renderLogo({ palette: 'stellar' }));

// Style a single line
console.log(gradientLine('Hello World', { palette: 'stellar' }));

// Use star icons
console.log(`${STAR_ICONS.filled} Status: OK`);
```

---

## Color Palettes

### Theme Palettes

| Palette     | Theme | RGB Gradient              | Use For                     |
|-------------|-------|---------------------------|-----------------------------|
| `stellar`   | Dark  | White → Ice Blue → Cyan   | Primary brand, highlights   |
| `moonlight` | Dark  | Slate → Silver → Gray     | Secondary text, labels      |
| `daylight`  | Light | Navy → Royal → Bright Blue| Primary brand (light term)  |
| `dusk`      | Light | Dark Slate → Slate        | Secondary (light term)      |

### Semantic Palettes

| Palette   | Use For                              |
|-----------|--------------------------------------|
| `success` | Success messages, completed states   |
| `warning` | Warning messages, caution states     |
| `error`   | Error messages, failed states        |

### Using Palettes

```typescript
import { PALETTES, THEMES } from './design-system/index.js';

// Access a palette directly
const stellar = PALETTES.stellar;
console.log(stellar.rgb); // [[240,249,255], [186,230,253], [125,211,252]]

// Theme-aware selection
const darkPrimary = THEMES.dark.primary;   // 'stellar'
const lightPrimary = THEMES.light.primary; // 'daylight'
```

---

## Gradient Functions

### `gradientLine(text, options)`

Apply gradient to a single line of text.

```typescript
import { gradientLine } from './design-system/index.js';

// Basic usage
gradientLine('Hello World', { palette: 'stellar' });

// With bold
gradientLine('Important!', { palette: 'stellar', bold: true });

// Different palette
gradientLine('Warning text', { palette: 'warning' });
```

### `gradientText(text, options)`

Apply gradient to multi-line text (like ASCII art).

```typescript
import { gradientText } from './design-system/index.js';

const asciiArt = `
╔═══════╗
║ HELLO ║
╚═══════╝
`;

// Horizontal gradient (each line gets full gradient)
gradientText(asciiArt, { palette: 'stellar', direction: 'horizontal' });

// Vertical gradient (color changes top to bottom)
gradientText(asciiArt, { palette: 'stellar', direction: 'vertical' });

// Diagonal gradient (color changes diagonally)
gradientText(asciiArt, { palette: 'stellar', direction: 'diagonal' });
```

### Options

| Option      | Type                                      | Default        | Description              |
|-------------|-------------------------------------------|----------------|--------------------------|
| `palette`   | `PaletteName \| Palette`                  | `'stellar'`    | Color palette to use     |
| `direction` | `'horizontal' \| 'vertical' \| 'diagonal'`| `'horizontal'` | Gradient direction       |
| `bold`      | `boolean`                                 | `false`        | Apply bold styling       |

---

## ASCII Logo

### `renderLogo(options)`

Render the full Stargazer ASCII logo.

```typescript
import { renderLogo } from './design-system/index.js';

// Basic logo
renderLogo({ palette: 'stellar' });
// Output:
//   ✦ ╔═╗╔╦╗╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╦═╗ ✦
//  ✧  ╚═╗ ║ ╠═╣╠╦╝║ ╦╠═╣╔═╝║╣ ╠╦╝  ✧
//   ✦ ╚═╝ ╩ ╩ ╩╩╚═╚═╝╩ ╩╚═╝╚═╝╩╚═ ✦

// With version and tagline
renderLogo({
  palette: 'stellar',
  showVersion: true,
  version: '0.1.0',
  tagline: 'AI-Powered Code Review',
});

// Slim variant (no stars)
renderLogo({ palette: 'stellar', slim: true });
```

### `renderCompactLogo(options)`

Render a single-line compact logo.

```typescript
import { renderCompactLogo } from './design-system/index.js';

renderCompactLogo({ palette: 'stellar' });
// Output: "★ STARGAZER" with gradient
```

### Logo Options

| Option        | Type          | Default      | Description                |
|---------------|---------------|--------------|----------------------------|
| `palette`     | `PaletteName` | `'stellar'`  | Color palette              |
| `direction`   | `GradientDirection` | `'horizontal'` | Gradient direction   |
| `showVersion` | `boolean`     | `false`      | Show version below logo    |
| `version`     | `string`      | `'0.1.0'`    | Version string             |
| `tagline`     | `string`      | `undefined`  | Tagline below logo         |
| `slim`        | `boolean`     | `false`      | Use slim font (no stars)   |

---

## Star Icons

Available star and celestial icons:

```typescript
import { STAR_ICONS } from './design-system/index.js';

STAR_ICONS.filled       // ✦ - Primary actions
STAR_ICONS.outline      // ✧ - Secondary actions
STAR_ICONS.star         // ★ - Highlights
STAR_ICONS.emptyStar    // ☆ - Inactive/empty
STAR_ICONS.diamond      // ◇ - Navigation/browse
STAR_ICONS.filledDiamond// ◈ - Settings
STAR_ICONS.circle       // ○ - Help/info
STAR_ICONS.emptyCircle  // ◌ - Exit/close
```

### Icon Usage in Menus

```typescript
const menuItems = [
  `${STAR_ICONS.filled} Review staged changes`,
  `${STAR_ICONS.outline} Discover conventions`,
  `${STAR_ICONS.diamond} Browse history`,
  `${STAR_ICONS.filledDiamond} Settings`,
  `${STAR_ICONS.emptyCircle} Exit`,
];
```

---

## Usage Examples

### Header Component

```typescript
import { Box, Text } from 'ink';
import { gradientText, gradientLine, STAR_LOGO } from '../design-system/index.js';

export function Header({ projectName }) {
  const styledLogo = gradientText(STAR_LOGO, {
    palette: 'stellar',
    direction: 'horizontal',
  });

  return (
    <Box flexDirection="column">
      <Text>{styledLogo}</Text>
      <Text dimColor>⌬ {projectName}</Text>
    </Box>
  );
}
```

### Status Indicator

```typescript
import { gradientLine, STAR_ICONS } from '../design-system/index.js';

const status = isOk
  ? gradientLine(`${STAR_ICONS.filled} OK`, { palette: 'success' })
  : gradientLine(`${STAR_ICONS.circle} Error`, { palette: 'error' });
```

### Progress Display

```typescript
import { gradientLine, STAR_ICONS } from '../design-system/index.js';

function renderPhase(label, isComplete) {
  const icon = isComplete ? STAR_ICONS.filled : STAR_ICONS.outline;
  const text = `${icon} ${label}`;
  return isComplete
    ? gradientLine(text, { palette: 'stellar' })
    : text;
}
```

---

## File Structure

```
design-system/
├── index.ts        # Main exports
├── palettes.ts     # Color palettes & icons
├── gradient.ts     # Gradient text functions
├── ascii-logo.ts   # Logo rendering
└── README.md       # This documentation
```

---

## Design Principles

1. **Minimalist**: Only essential palettes and functions
2. **Theme-aware**: Supports both dark and light terminals
3. **Semantic colors**: Success/warning/error for state feedback
4. **Star-themed**: Consistent cosmic/stellar iconography
5. **No dependencies**: Only chalk for ANSI colors

---

## Adding Custom Palettes

```typescript
import { gradientLine, type Palette } from '../design-system/index.js';

const customPalette: Palette = {
  name: 'custom',
  colors: ['#ff0000', '#00ff00', '#0000ff'],
  rgb: [[255, 0, 0], [0, 255, 0], [0, 0, 255]],
  description: 'RGB rainbow',
};

gradientLine('Custom gradient!', { palette: customPalette });
```
