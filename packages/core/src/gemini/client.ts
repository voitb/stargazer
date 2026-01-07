import { GoogleGenAI } from '@google/genai';
import * as z from 'zod';
import { ok, err } from '../shared/result';
import type { Result } from '../shared/result';
import type { GeminiClient, GenerateOptions, GeminiClientOptions } from './types';
import { DEFAULT_MODEL } from './models';
import { withRetry } from '../shared/retry';

export function createGeminiClient(
  apiKey: string,
  defaultModel: string | undefined = DEFAULT_MODEL,
  options: GeminiClientOptions = {}
): GeminiClient {
  const {
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    // timeout is no longer used - we let Gemini take as long as needed
    // Connection failures are handled by the underlying HTTP client
  } = options;

  const client = new GoogleGenAI({ apiKey });

  return {
    generate: async <T extends z.ZodType>(
      prompt: string,
      schema: T,
      generateOptions?: GenerateOptions
    ): Promise<Result<z.infer<T>>> => {
      const doGenerate = async (): Promise<Result<z.infer<T>>> => {
        try {
          // No artificial timeout - let Gemini respond at its own pace
          // Connection failures are handled by the underlying HTTP client's default timeout
          const response = await client.models.generateContent({
            model: generateOptions?.model ?? defaultModel,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseJsonSchema: z.toJSONSchema(schema, { target: 'openapi-3.0' }),
              temperature: generateOptions?.temperature ?? 0.2,
            },
          });

          const text = response.text;
          if (!text) {
            return err({ code: 'EMPTY_RESPONSE', message: 'Gemini returned empty response' });
          }

          // Parse JSON safely
          let jsonData: unknown;
          try {
            jsonData = JSON.parse(text);
          } catch (parseError) {
            return err({
              code: 'SCHEMA_VALIDATION',
              message: `Invalid JSON from Gemini: ${parseError instanceof Error ? parseError.message : 'parse error'}`,
              cause: parseError,
            });
          }

          const parsed = schema.safeParse(jsonData);
          if (!parsed.success) {
            return err({ code: 'SCHEMA_VALIDATION', message: z.prettifyError(parsed.error) });
          }

          return ok(parsed.data);
        } catch (e) {
          if (e instanceof Error && 'status' in e) {
            const status = (e as { status: number }).status;
            if (status === 429) {
              return err({ code: 'RATE_LIMITED', message: e.message, cause: e });
            }
            if (status === 401) {
              return err({ code: 'UNAUTHORIZED', message: e.message, cause: e });
            }
            if (status === 400) {
              return err({ code: 'BAD_REQUEST', message: e.message, cause: e });
            }
          }

          // Handle network/connection errors
          if (e instanceof Error && (e.message.includes('ECONNREFUSED') || e.message.includes('ETIMEDOUT') || e.message.includes('fetch failed'))) {
            return err({
              code: 'CONNECTION_ERROR',
              message: 'Failed to connect to Gemini API. Please check your internet connection.',
              cause: e,
            });
          }

          return err({ code: 'API_ERROR', message: String(e), cause: e });
        }
      };

      if (enableRetry) {
        return withRetry(doGenerate, {
          maxRetries,
          baseDelay: retryDelay,
          onRetry: (attempt, delay) => {
            console.warn(
              `[Stargazer] Rate limited, retrying in ${Math.round(delay)}ms (attempt ${attempt}/${maxRetries})`
            );
          },
        });
      }

      return doGenerate();
    },
  };
}
