/**
 * Stargazer CLI Design System - Terminal Size Utilities
 *
 * Terminal size detection for non-React usage.
 *
 * @example
 * ```typescript
 * import { getTerminalSize, getBreakpoint } from './terminal-size.js';
 *
 * const { columns, rows } = getTerminalSize();
 * const breakpoint = getBreakpoint(); // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * ```
 */

import { breakpoints, type Breakpoint, type LogoVariant, breakpointToLogo } from '../logo/responsive.js';

export interface TerminalSize {
  columns: number;
  rows: number;
}

/**
 * Default terminal size if stdout is not available
 */
export const DEFAULT_SIZE: TerminalSize = {
  columns: 80,
  rows: 24,
};

/**
 * Get current terminal size
 *
 * Falls back to default size if stdout is not available.
 */
export function getTerminalSize(): TerminalSize {
  if (process.stdout.isTTY) {
    return {
      columns: process.stdout.columns ?? DEFAULT_SIZE.columns,
      rows: process.stdout.rows ?? DEFAULT_SIZE.rows,
    };
  }

  return DEFAULT_SIZE;
}

/**
 * Get terminal width only
 */
export function getTerminalWidth(): number {
  return getTerminalSize().columns;
}

/**
 * Get terminal height only
 */
export function getTerminalHeight(): number {
  return getTerminalSize().rows;
}

/**
 * Get current breakpoint based on terminal width
 */
export function getBreakpoint(): Breakpoint {
  const width = getTerminalWidth();

  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * Get logo variant for current terminal width
 */
export function getLogoVariant(): LogoVariant {
  const breakpoint = getBreakpoint();
  return breakpointToLogo[breakpoint];
}

/**
 * Check if terminal is at or above a breakpoint
 */
export function isAboveBreakpoint(minBreakpoint: Breakpoint): boolean {
  const order: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const currentBreakpoint = getBreakpoint();

  const currentIndex = order.indexOf(currentBreakpoint);
  const minIndex = order.indexOf(minBreakpoint);

  return currentIndex >= minIndex;
}

/**
 * Check if terminal is wide enough for full logo
 */
export function canShowFullLogo(): boolean {
  return isAboveBreakpoint('lg');
}

/**
 * Check if terminal is wide enough for tagline
 */
export function canShowTagline(): boolean {
  return isAboveBreakpoint('xl');
}

/**
 * Calculate centered padding for content of given width
 */
export function getCenterPadding(contentWidth: number): number {
  const terminalWidth = getTerminalWidth();
  return Math.max(0, Math.floor((terminalWidth - contentWidth) / 2));
}

/**
 * Get safe content width (with margins)
 *
 * @param margin - Margin on each side (default: 2)
 */
export function getSafeWidth(margin: number = 2): number {
  return Math.max(20, getTerminalWidth() - margin * 2);
}

/**
 * Truncate text to fit terminal width
 */
export function truncateToFit(
  text: string,
  maxWidth?: number,
  ellipsis: string = '...'
): string {
  const max = maxWidth ?? getSafeWidth();

  if (text.length <= max) {
    return text;
  }

  return text.slice(0, max - ellipsis.length) + ellipsis;
}
