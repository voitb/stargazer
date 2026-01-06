import type { ResolvedConfig } from './types';
import { DEFAULT_CONFIG } from './defaults';
import { StargazerConfigSchema } from './schemas';

export function resolveConfig(config?: unknown): ResolvedConfig {
  if (!config) {
    return DEFAULT_CONFIG;
  }

  const parsed = StargazerConfigSchema.safeParse(config);

  if (!parsed.success) {
    throw new Error(`Invalid config: ${parsed.error.message}`);
  }

  return {
    model: parsed.data.model ?? DEFAULT_CONFIG.model,
    minSeverity: parsed.data.minSeverity ?? DEFAULT_CONFIG.minSeverity,
    maxIssues: parsed.data.maxIssues ?? DEFAULT_CONFIG.maxIssues,
    ignore: parsed.data.ignore ?? DEFAULT_CONFIG.ignore,
    plugins: parsed.data.plugins ?? DEFAULT_CONFIG.plugins,
  };
}

export function mergeIgnorePatterns(
  base: readonly string[],
  additional: readonly string[]
): readonly string[] {
  return [...new Set([...base, ...additional])];
}
