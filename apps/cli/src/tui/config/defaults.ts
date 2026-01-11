/**
 * Centralized default values for the TUI application.
 * Single source of truth for all default configurations.
 */

export type Provider = 'gemini' | 'glm';

// ═══════════════════════════════════════════════════════════════════════════
// TIMEOUT DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_TIMEOUT = 60000;

// ═══════════════════════════════════════════════════════════════════════════
// MODEL DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_MODELS: Record<Provider, string> = {
  gemini: 'gemini-3-flash-preview',
  glm: 'glm-4-flash',
} as const;

export const SECONDARY_MODELS: Record<Provider, string> = {
  gemini: 'gemini-2.5-flash',
  glm: 'glm-4.5-flash',
} as const;

/**
 * Get the default model for a provider.
 */
export function getDefaultModel(provider: Provider): string {
  return DEFAULT_MODELS[provider];
}

/**
 * Get the secondary (fallback) model for a provider.
 */
export function getSecondaryModel(provider: Provider): string {
  return SECONDARY_MODELS[provider];
}
