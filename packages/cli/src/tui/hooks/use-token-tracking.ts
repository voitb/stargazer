/**
 * Token Tracking Hook
 *
 * Provides reactive token usage information for chat sessions.
 */

import { useMemo } from 'react';
import {
  getModelLimit,
  calculateMessageTokens,
  getWarningLevel,
  getUsagePercentage,
  formatTokenCount,
  type WarningLevel,
} from '../utils/token-counter.js';

interface Message {
  content: string;
  tokenCount?: number;
}

export interface TokenUsage {
  /** Current token count */
  current: number;
  /** Token limit for the model */
  limit: number;
  /** Usage as percentage (0-100) */
  percentage: number;
  /** Warning level based on usage */
  warningLevel: WarningLevel;
  /** Formatted current count (e.g., "1.5K") */
  formattedCurrent: string;
  /** Formatted limit (e.g., "32K") */
  formattedLimit: string;
}

/**
 * Hook for tracking token usage in a chat session
 *
 * @param messages - Array of chat messages
 * @param model - Current model name
 * @returns Token usage information
 *
 * @example
 * ```tsx
 * const { current, limit, percentage, warningLevel } = useTokenTracking(
 *   messages,
 *   'gemini-1.5-pro'
 * );
 *
 * <TokenBadge current={current} limit={limit} />
 * <Text color={warningLevel === 'critical' ? 'red' : 'green'}>
 *   {percentage}% used
 * </Text>
 * ```
 */
export function useTokenTracking(
  messages: readonly Message[],
  model: string
): TokenUsage {
  return useMemo(() => {
    const current = calculateMessageTokens([...messages]);
    const limit = getModelLimit(model);
    const percentage = getUsagePercentage(current, limit);
    const warningLevel = getWarningLevel(current, limit);

    return {
      current,
      limit,
      percentage,
      warningLevel,
      formattedCurrent: formatTokenCount(current),
      formattedLimit: formatTokenCount(limit),
    };
  }, [messages, model]);
}
