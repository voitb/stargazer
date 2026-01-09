/**
 * Terminal capabilities detection.
 * Useful for graceful degradation on constrained terminals.
 */
export interface TerminalCapabilities {
  /** Is the terminal a TTY? */
  isTTY: boolean;
  /** Terminal type from TERM env variable */
  termType: string | undefined;
  /** Color depth (1, 4, 8, or 24) */
  colorDepth: number;
  /** Is this a constrained terminal (CI, dumb, etc.)? */
  isConstrained: boolean;
  /** Does the terminal support basic colors? */
  supportsColor: boolean;
  /** Does the terminal support 256 colors? */
  supports256Colors: boolean;
  /** Does the terminal support true color (24-bit)? */
  supportsTrueColor: boolean;
}

/**
 * Hook to detect terminal capabilities.
 * Returns information about what the current terminal supports.
 */
export function useTerminalCapabilities(): TerminalCapabilities {
  const isTTY = process.stdout.isTTY ?? false;
  const termType = process.env['TERM'];
  const colorDepth = process.stdout.getColorDepth?.() ?? 1;

  const isConstrained =
    !isTTY ||
    termType === 'dumb' ||
    termType === undefined ||
    colorDepth < 4;

  return {
    isTTY,
    termType,
    colorDepth,
    isConstrained,
    supportsColor: colorDepth >= 4,
    supports256Colors: colorDepth >= 8,
    supportsTrueColor: colorDepth >= 24,
  };
}
