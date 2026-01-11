/**
 * Input History Hook
 *
 * Manages input history for chat, allowing navigation through previous inputs
 * with up/down arrow keys.
 */

import { useState, useCallback, useRef } from 'react';

interface UseInputHistoryOptions {
  /** Maximum history entries to keep */
  maxEntries?: number;
}

interface UseInputHistoryResult {
  /** Current history entries */
  history: readonly string[];
  /** Current history index (-1 = not browsing history) */
  historyIndex: number;
  /** Add entry to history */
  addEntry: (entry: string) => void;
  /** Navigate up in history (older entries) */
  navigateUp: (currentValue: string) => string | null;
  /** Navigate down in history (newer entries or back to current) */
  navigateDown: () => string | null;
  /** Reset history navigation (when user types) */
  resetNavigation: () => void;
  /** Check if currently browsing history */
  isBrowsingHistory: boolean;
}

/**
 * Hook for managing input history with up/down navigation
 *
 * @example
 * ```tsx
 * const { history, navigateUp, navigateDown, addEntry } = useInputHistory();
 *
 * // On submit
 * addEntry(value);
 *
 * // On up arrow
 * const prev = navigateUp(currentValue);
 * if (prev !== null) setValue(prev);
 *
 * // On down arrow
 * const next = navigateDown();
 * if (next !== null) setValue(next);
 * ```
 */
export function useInputHistory({
  maxEntries = 100,
}: UseInputHistoryOptions = {}): UseInputHistoryResult {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const savedValue = useRef('');

  const addEntry = useCallback((entry: string) => {
    const trimmed = entry.trim();
    if (!trimmed) return;

    setHistory(prev => {
      // Don't add duplicates at the end
      if (prev[prev.length - 1] === trimmed) {
        return prev;
      }
      const newHistory = [...prev, trimmed];
      // Limit history size
      if (newHistory.length > maxEntries) {
        return newHistory.slice(-maxEntries);
      }
      return newHistory;
    });

    // Reset navigation after adding
    setHistoryIndex(-1);
    savedValue.current = '';
  }, [maxEntries]);

  const navigateUp = useCallback((currentValue: string): string | null => {
    if (history.length === 0) return null;

    // Save current value when starting to browse
    if (historyIndex === -1) {
      savedValue.current = currentValue;
    }

    const newIndex = Math.min(historyIndex + 1, history.length - 1);
    if (newIndex === historyIndex) return null;

    setHistoryIndex(newIndex);
    // History is stored oldest-first, so we access from the end
    return history[history.length - 1 - newIndex] ?? null;
  }, [history, historyIndex]);

  const navigateDown = useCallback((): string | null => {
    if (historyIndex < 0) return null;

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);

    if (newIndex < 0) {
      // Return to saved value
      return savedValue.current;
    }

    return history[history.length - 1 - newIndex] ?? null;
  }, [history, historyIndex]);

  const resetNavigation = useCallback(() => {
    if (historyIndex !== -1) {
      setHistoryIndex(-1);
      savedValue.current = '';
    }
  }, [historyIndex]);

  return {
    history,
    historyIndex,
    addEntry,
    navigateUp,
    navigateDown,
    resetNavigation,
    isBrowsingHistory: historyIndex >= 0,
  };
}
