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
