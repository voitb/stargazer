/**
 * Stargazer CLI Design System - ASCII Logo
 *
 * Renders the Stargazer brand logo in ASCII art with gradient colors.
 * Inspired by Claude Code and Gemini CLI's signature look.
 *
 * @example
 * ```typescript
 * import { renderLogo, renderCompactLogo } from './ascii-logo.js';
 *
 * // Full star-themed logo
 * console.log(renderLogo({ palette: 'stellar' }));
 *
 * // Compact single-line logo
 * console.log(renderCompactLogo());
 * ```
 */

import { gradientText, gradientLine } from '../../theme/gradient.js';
import { STAR_ICONS, type PaletteName } from '../../theme/palettes.js';

// ═══════════════════════════════════════════════════════════════
// LOGO FONTS
// ═══════════════════════════════════════════════════════════════

/**
 * Star font - Primary logo with decorative star accents
 * This is the main brand logo used in headers
 */
export const STAR_LOGO = `  ${STAR_ICONS.filled} ╔═╗╔╦╗╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╦═╗ ${STAR_ICONS.filled}
 ${STAR_ICONS.outline}  ╚═╗ ║ ╠═╣╠╦╝║ ╦╠═╣╔═╝║╣ ╠╦╝  ${STAR_ICONS.outline}
  ${STAR_ICONS.filled} ╚═╝ ╩ ╩ ╩╩╚═╚═╝╩ ╩╚═╝╚═╝╩╚═ ${STAR_ICONS.filled}`;

/**
 * Slim font - Compact alternative for smaller displays
 */
export const SLIM_LOGO = `╔═╗╔╦╗╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╦═╗
╚═╗ ║ ╠═╣╠╦╝║ ╦╠═╣╔═╝║╣ ╠╦╝
╚═╝ ╩ ╩ ╩╩╚═╚═╝╩ ╩╚═╝╚═╝╩╚═`;

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

interface LogoOptions {
  /** Color palette to use */
  palette?: PaletteName;
  /** Gradient direction */
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  /** Show version number below logo */
  showVersion?: boolean;
  /** Version string */
  version?: string;
  /** Tagline below logo */
  tagline?: string;
  /** Use slim font instead of star font */
  slim?: boolean;
}

/**
 * Render the Stargazer ASCII logo with gradient colors
 *
 * @param options - Logo rendering options
 * @returns Colored ASCII art string
 *
 * @example
 * ```typescript
 * // Basic usage
 * renderLogo({ palette: 'stellar' })
 *
 * // With version and tagline
 * renderLogo({
 *   palette: 'stellar',
 *   showVersion: true,
 *   version: '0.1.0',
 *   tagline: 'AI-Powered Code Review'
 * })
 * ```
 */
export function renderLogo(options: LogoOptions = {}): string {
  const {
    palette = 'stellar',
    direction = 'horizontal',
    showVersion = false,
    version = '0.1.0',
    tagline,
    slim = false,
  } = options;

  const logoArt = slim ? SLIM_LOGO : STAR_LOGO;
  const gradientLogo = gradientText(logoArt, { palette, direction });

  const lines: string[] = [gradientLogo];

  if (tagline) {
    const taglineStyled = gradientLine(tagline, { palette });
    lines.push('', taglineStyled);
  }

  if (showVersion) {
    const versionStyled = gradientLine(`⌬ v${version}`, { palette });
    lines.push('', versionStyled);
  }

  return lines.join('\n');
}

/**
 * Render a compact single-line logo
 *
 * @param options - Logo options
 * @returns Colored single-line string
 *
 * @example
 * ```typescript
 * renderCompactLogo({ palette: 'stellar' })
 * // Output: "★ STARGAZER" with gradient
 * ```
 */
export function renderCompactLogo(options: { palette?: PaletteName } = {}): string {
  const { palette = 'stellar' } = options;
  return gradientLine(`${STAR_ICONS.star} STARGAZER`, { palette, bold: true });
}

/**
 * Get just the star icon with gradient
 *
 * @param options - Options
 * @returns Colored star icon
 */
export function renderStarIcon(options: { palette?: PaletteName } = {}): string {
  const { palette = 'stellar' } = options;
  return gradientLine(STAR_ICONS.filled, { palette });
}
