import type * as z from 'zod';
import type { Result } from '../shared/result';

export type GenerateOptions = {
  /** Model name - can be any valid Gemini model string */
  readonly model?: string;
  readonly temperature?: number;
};

export type GeminiClientOptions = {
  readonly enableRetry?: boolean;
  readonly maxRetries?: number;
  readonly retryDelay?: number;
  /** Request timeout in milliseconds (default: 60000) */
  readonly timeout?: number;
};

export type GeminiClient = {
  readonly generate: <T extends z.ZodType>(
    prompt: string,
    schema: T,
    options?: GenerateOptions
  ) => Promise<Result<z.infer<T>>>;
};
