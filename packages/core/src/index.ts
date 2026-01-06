export const VERSION = '0.0.0';

export type { Result } from './shared/result';
export { ok, err, isOk, isErr } from './shared/result';

export type { ErrorCode, ApiError } from './shared/error-codes';

export { createGeminiClient } from './gemini/client';
export type { GeminiClient } from './gemini/types';

export { reviewDiff } from './review/reviewer';

export type { Severity, Category, Decision, Issue, ReviewResult, ReviewOptions } from './review/types';
export { SEVERITIES, CATEGORIES, DECISIONS } from './review/types';

export { SeveritySchema, CategorySchema, DecisionSchema, IssueSchema, ReviewResultSchema, ReviewResultJSONSchema } from './review/schemas';

export type { ConventionPattern, ConventionCategory, ProjectConventions, FileContext } from './conventions/types';
export { ConventionPatternSchema, ProjectConventionsSchema } from './conventions/schemas';
export { readProjectFiles } from './conventions/file-reader';
export { buildDiscoveryPrompt } from './conventions/prompts';
export { discoverConventions, type DiscoverOptions } from './conventions/discovery';
export { saveConventions, loadConventions } from './conventions/cache';

export type {
  StargazerPlugin,
  PluginFactory,
  ReviewContext,
} from './plugins/types';
export { runBeforeReviewHooks, runAfterReviewHooks, runFilterHooks } from './plugins/hooks';
export { ignorePathsPlugin } from './plugins/ignore-paths';
export type { IgnorePathsOptions } from './plugins/ignore-paths';

export { defineConfig } from './config/define';
export { resolveConfig, mergeIgnorePatterns } from './config/resolve';
export { DEFAULT_CONFIG } from './config/defaults';
export type { StargazerConfig, ResolvedConfig, Model } from './config/types';

export { createStargazer } from './stargazer';
export type { Stargazer, StargazerOptions, ReviewOptions as StargazerReviewOptions } from './stargazer';
