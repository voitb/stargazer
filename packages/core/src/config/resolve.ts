import type { StargazerConfig, ResolvedConfig } from './types';
import { DEFAULT_CONFIG } from './defaults';

export function resolveConfig(config?: StargazerConfig): ResolvedConfig {
  if (!config) {
    return DEFAULT_CONFIG;
  }

  return {
    model: config.model ?? DEFAULT_CONFIG.model,
    minSeverity: config.minSeverity ?? DEFAULT_CONFIG.minSeverity,
    maxIssues: config.maxIssues ?? DEFAULT_CONFIG.maxIssues,
    ignore: config.ignore ?? DEFAULT_CONFIG.ignore,
    plugins: config.plugins ?? DEFAULT_CONFIG.plugins,
  };
}

export function mergeIgnorePatterns(
  base: readonly string[],
  additional: readonly string[]
): readonly string[] {
  return [...new Set([...base, ...additional])];
}
