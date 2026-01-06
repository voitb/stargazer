import { GoogleGenAI } from '@google/genai';
import * as z from 'zod';
import { ok, err } from '../shared/result';
import type { Result } from '../shared/result';
import type { GeminiClient, GenerateOptions, GeminiClientOptions } from './types';
import { DEFAULT_MODEL } from './models';
import { withRetry } from '../shared/retry';

export function createGeminiClient(
  apiKey: string,
  defaultModel = DEFAULT_MODEL,
  options: GeminiClientOptions = {}
): GeminiClient {
  const {
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 60000,
  } = options;

  const client = new GoogleGenAI({ apiKey });

  return {
    generate: async <T extends z.ZodType>(
      prompt: string,
      schema: T,
      generateOptions?: GenerateOptions
    ): Promise<Result<z.infer<T>>> => {
      const doGenerate = async (): Promise<Result<z.infer<T>>> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          // Create a promise that rejects on timeout
          const timeoutPromise = new Promise<never>((_, reject) => {
            controller.signal.addEventListener('abort', () => {
              reject(new Error('Request timeout'));
            });
          });

          // Race the API call with the timeout
          const response = await Promise.race([
            client.models.generateContent({
              model: generateOptions?.model ?? defaultModel,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                responseJsonSchema: z.toJSONSchema(schema, { target: 'openapi-3.0' }),
                temperature: generateOptions?.temperature ?? 0.2,
              },
            }),
            timeoutPromise,
          ]) as Awaited<ReturnType<typeof client.models.generateContent>>;

          clearTimeout(timeoutId);

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
          clearTimeout(timeoutId);

          if (e instanceof Error && e.name === 'AbortError') {
            return err({
              code: 'TIMEOUT',
              message: `Request timed out after ${timeout}ms`,
            });
          }

          if (e instanceof Error && e.message === 'Request timeout') {
            return err({
              code: 'TIMEOUT',
              message: `Request timed out after ${timeout}ms`,
            });
          }

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
