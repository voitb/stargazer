/**
 * Settings screen configuration constants.
 */

export interface TimeoutOption {
  readonly label: string;
  readonly value: number;
}

/**
 * Available timeout options for AI review requests.
 * Values are in milliseconds.
 */
export const TIMEOUT_OPTIONS: readonly TimeoutOption[] = [
  { label: '30 seconds', value: 30000 },
  { label: '1 minute', value: 60000 },
  { label: '2 minutes', value: 120000 },
  { label: '5 minutes', value: 300000 },
] as const;

/**
 * Get label for a timeout value.
 */
export function getTimeoutLabel(value: number): string {
  const option = TIMEOUT_OPTIONS.find((opt) => opt.value === value);
  return option?.label ?? `${value / 1000} seconds`;
}
