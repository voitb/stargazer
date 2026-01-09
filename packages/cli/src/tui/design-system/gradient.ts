/**
 * Stargazer CLI Design System - Gradient Text Utilities
 *
 * Core functions for rendering gradient-colored text in terminals.
 * Uses chalk for ANSI color codes with RGB interpolation.
 *
 * @example
 * ```typescript
 * import { gradientLine, gradientText } from './gradient.js';
 *
 * // Single line gradient
 * console.log(gradientLine('Hello World', { palette: 'stellar' }));
 *
 * // Multi-line gradient
 * console.log(gradientText(asciiArt, { palette: 'stellar', direction: 'horizontal' }));
 * ```
 */

import chalk from 'chalk';
import type { RGB, Palette, PaletteName } from './palettes.js';
import { PALETTES, DEFAULT_PALETTE } from './palettes.js';

export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal';

interface GradientOptions {
  /** Palette name or custom palette object */
  palette?: PaletteName | Palette;
  /** Gradient direction for multi-line text */
  direction?: GradientDirection;
  /** Apply bold styling */
  bold?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Interpolate between two RGB colors
 */
function interpolateColor(color1: RGB, color2: RGB, factor: number): RGB {
  return [
    Math.round(color1[0] + (color2[0] - color1[0]) * factor),
    Math.round(color1[1] + (color2[1] - color1[1]) * factor),
    Math.round(color1[2] + (color2[2] - color1[2]) * factor),
  ];
}

/**
 * Get color at a specific position in a multi-stop gradient
 */
function getGradientColor(colors: RGB[], position: number): RGB {
  if (colors.length === 0) return [255, 255, 255];
  const firstColor = colors[0] ?? [255, 255, 255];
  const lastColor = colors[colors.length - 1] ?? firstColor;
  if (colors.length === 1) return firstColor;

  const scaledPos = position * (colors.length - 1);
  const index = Math.floor(scaledPos);
  const factor = scaledPos - index;

  if (index >= colors.length - 1) return lastColor;

  const start = colors[index] ?? firstColor;
  const end = colors[index + 1] ?? lastColor;
  return interpolateColor(start, end, factor);
}

/**
 * Resolve palette from name or object
 */
function resolvePalette(palette: PaletteName | Palette | undefined): Palette {
  if (!palette) return PALETTES[DEFAULT_PALETTE];
  if (typeof palette === 'string') return PALETTES[palette];
  return palette;
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/**
 * Apply gradient colors to a single line of text
 *
 * @param text - The text to colorize
 * @param options - Gradient options
 * @returns Colored string with ANSI codes
 *
 * @example
 * ```typescript
 * gradientLine('★ STARGAZER', { palette: 'stellar', bold: true })
 * ```
 */
export function gradientLine(text: string, options: GradientOptions = {}): string {
  const palette = resolvePalette(options.palette);
  const colors = palette.rgb;
  const chars = [...text];
  const length = chars.filter(c => c !== ' ').length;

  let colorIndex = 0;
  const result = chars.map((char) => {
    if (char === ' ') return char;

    const position = colorIndex / Math.max(length - 1, 1);
    const [r, g, b] = getGradientColor(colors, position);
    colorIndex++;

    const coloredChar = chalk.rgb(r, g, b)(char);
    return options.bold ? chalk.bold(coloredChar) : coloredChar;
  });

  return result.join('');
}

/**
 * Apply gradient colors to multi-line text (like ASCII art)
 *
 * @param text - Multi-line text to colorize
 * @param options - Gradient options including direction
 * @returns Colored string with ANSI codes
 *
 * @example
 * ```typescript
 * gradientText(asciiLogo, {
 *   palette: 'stellar',
 *   direction: 'horizontal'
 * })
 * ```
 */
export function gradientText(text: string, options: GradientOptions = {}): string {
  const palette = resolvePalette(options.palette);
  const direction = options.direction ?? 'horizontal';
  const colors = palette.rgb;
  const lines = text.split('\n');

  if (direction === 'horizontal') {
    // Each line gets its own horizontal gradient
    return lines.map(line => gradientLine(line, options)).join('\n');
  }

  if (direction === 'vertical') {
    // Color changes per line (top to bottom)
    return lines.map((line, lineIndex) => {
      const position = lineIndex / Math.max(lines.length - 1, 1);
      const [r, g, b] = getGradientColor(colors, position);
      const colored = chalk.rgb(r, g, b)(line);
      return options.bold ? chalk.bold(colored) : colored;
    }).join('\n');
  }

  // Diagonal gradient (position = line + char index)
  const maxLen = Math.max(...lines.map(l => l.length));
  const totalSteps = lines.length + maxLen;

  return lines.map((line, lineIndex) => {
    const chars = [...line];
    return chars.map((char, charIndex) => {
      if (char === ' ') return char;

      const position = (lineIndex + charIndex) / Math.max(totalSteps - 1, 1);
      const [r, g, b] = getGradientColor(colors, position);
      const colored = chalk.rgb(r, g, b)(char);
      return options.bold ? chalk.bold(colored) : colored;
    }).join('');
  }).join('\n');
}
