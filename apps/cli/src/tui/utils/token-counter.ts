/**
 * Token Counting Utilities
 *
 * Provides token estimation and model limit information for context management.
 */

/**
 * Model context limits (tokens)
 * These are approximate limits - actual limits may vary by provider tier
 */
export const MODEL_LIMITS: Record<string, number> = {
  // Gemini
  'gemini-pro': 32_768,
  'gemini-1.5-pro': 1_048_576,
  'gemini-1.5-flash': 1_048_576,
  'gemini-2.0-flash-exp': 1_048_576,

  // OpenAI (if supported later)
  'gpt-4': 8_192,
  'gpt-4-turbo': 128_000,
  'gpt-4o': 128_000,

  // Anthropic (if supported later)
  'claude-3-opus': 200_000,
  'claude-3-sonnet': 200_000,
  'claude-3-haiku': 200_000,

  // Default fallback
  default: 32_768,
};

const DEFAULT_LIMIT = 32_768;

/**
 * Get context limit for a model
 */
export function getModelLimit(model: string): number {
  // Try exact match first
  if (model in MODEL_LIMITS) {
    return MODEL_LIMITS[model] ?? DEFAULT_LIMIT;
  }

  // Try prefix match (e.g., "gemini-1.5-pro-latest" → "gemini-1.5-pro")
  for (const [key, value] of Object.entries(MODEL_LIMITS)) {
    if (model.startsWith(key)) {
      return value;
    }
  }

  return DEFAULT_LIMIT;
}

/**
 * Estimate token count from text
 *
 * This is a rough approximation (~4 characters per token for English).
 * For accurate counting, use the provider's API (e.g., Gemini countTokens).
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English
  // This is intentionally conservative to avoid underestimating
  return Math.ceil(text.length / 4);
}

interface MessageWithTokens {
  content: string;
  tokenCount?: number;
}

/**
 * Calculate total tokens from messages
 */
export function calculateMessageTokens(messages: MessageWithTokens[]): number {
  return messages.reduce((sum, msg) => {
    // Use actual token count if available, otherwise estimate
    return sum + (msg.tokenCount ?? estimateTokens(msg.content));
  }, 0);
}

/**
 * Get usage percentage
 */
export function getUsagePercentage(current: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.round((current / limit) * 100);
}

export type WarningLevel = 'normal' | 'warning' | 'critical';

/**
 * Get warning level based on usage
 */
export function getWarningLevel(current: number, limit: number): WarningLevel {
  const percentage = getUsagePercentage(current, limit);
  if (percentage >= 90) return 'critical';
  if (percentage >= 80) return 'warning';
  return 'normal';
}

/**
 * Format token count for display
 */
export function formatTokenCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}
