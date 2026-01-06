import type * as z from 'zod';
import type { Result } from '../shared/result';
import type { Model } from './models';

export type GenerateOptions = {
  readonly model?: Model;
  readonly temperature?: number;
};

export type GeminiClientOptions = {
  readonly enableRetry?: boolean;
  readonly maxRetries?: number;
  readonly retryDelay?: number;
};

export type GeminiClient = {
  readonly generate: <T extends z.ZodType>(
    prompt: string,
    schema: T,
    options?: GenerateOptions
  ) => Promise<Result<z.infer<T>>>;
};
