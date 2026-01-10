/**
 * Stargazer CLI - Keymap Configuration
 *
 * Centralized keyboard shortcuts for consistent navigation.
 * Supports both arrow keys and vim-style navigation (hjkl).
 */

import type { Key } from 'ink';

/**
 * Available keyboard actions
 */
export type KeyAction =
  | 'nav.up'
  | 'nav.down'
  | 'nav.select'
  | 'nav.back'
  | 'app.quit'
  | 'app.cancel';

/**
 * Key binding definition
 */
export interface KeyBinding {
  /** Character key (e.g., 'j', 'k', 'q') */
  key?: string;
  /** Special key from Ink's Key type */
  specialKey?: 'upArrow' | 'downArrow' | 'leftArrow' | 'rightArrow' | 'escape' | 'return';
  /** Requires Ctrl modifier */
  ctrl?: boolean;
}

/**
 * Keymap configuration type
 */
export type KeymapConfig = Record<KeyAction, KeyBinding[]>;

/**
 * Default keymap - supports both arrow keys and vim-style navigation
 */
export const DEFAULT_KEYMAP: KeymapConfig = {
  'nav.up': [
    { specialKey: 'upArrow' },
    { key: 'k' },
  ],
  'nav.down': [
    { specialKey: 'downArrow' },
    { key: 'j' },
  ],
  'nav.select': [
    { specialKey: 'return' },
    { specialKey: 'rightArrow' },
    { key: 'l' },
  ],
  'nav.back': [
    { specialKey: 'escape' },
    { specialKey: 'leftArrow' },
    { key: 'h' },
    { key: 'b' },
  ],
  'app.quit': [
    { key: 'q' },
    { key: 'c', ctrl: true },
  ],
  'app.cancel': [
    { specialKey: 'escape' },
  ],
};

/**
 * Number keys for quick selection (1-9 selects items at index 0-8)
 */
export const QUICK_SELECT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

/**
 * Check if a key event matches a specific binding
 */
function matchesBinding(
  input: string,
  key: Key,
  binding: KeyBinding
): boolean {
  // Check special keys
  if (binding.specialKey) {
    const specialKeyMatches: Record<string, boolean | undefined> = {
      upArrow: key.upArrow,
      downArrow: key.downArrow,
      leftArrow: key.leftArrow,
      rightArrow: key.rightArrow,
      escape: key.escape,
      return: key.return,
    };
    if (!specialKeyMatches[binding.specialKey]) return false;
  }

  // Check character key
  if (binding.key !== undefined) {
    if (input.toLowerCase() !== binding.key.toLowerCase()) return false;
  }

  // Check Ctrl modifier
  if (binding.ctrl && !key.ctrl) return false;

  // At least one condition must be specified
  if (!binding.specialKey && binding.key === undefined) return false;

  return true;
}

/**
 * Check if input matches any binding for an action
 *
 * @param input - The character input from useInput
 * @param key - The Key object from useInput
 * @param action - The action to check for
 * @param keymap - Optional custom keymap (defaults to DEFAULT_KEYMAP)
 * @returns true if the input matches any binding for the action
 *
 * @example
 * useInput((input, key) => {
 *   if (matchesAction(input, key, 'nav.up')) {
 *     // Handle up navigation
 *   }
 * });
 */
export function matchesAction(
  input: string,
  key: Key,
  action: KeyAction,
  keymap: KeymapConfig = DEFAULT_KEYMAP
): boolean {
  const bindings = keymap[action];
  if (!bindings) return false;
  return bindings.some((binding) => matchesBinding(input, key, binding));
}

/**
 * Get quick select index from key (1-9 -> 0-8)
 *
 * @param input - The character input
 * @returns The index (0-8) or null if not a quick select key
 *
 * @example
 * const index = getQuickSelectIndex('3'); // returns 2
 * const none = getQuickSelectIndex('a');  // returns null
 */
export function getQuickSelectIndex(input: string): number | null {
  const idx = QUICK_SELECT_KEYS.indexOf(input as (typeof QUICK_SELECT_KEYS)[number]);
  return idx >= 0 ? idx : null;
}
