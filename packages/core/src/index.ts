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
