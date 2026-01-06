import { GoogleGenAI } from '@google/genai';
import * as z from 'zod';
import { ok, err } from '../shared/result';
import type { Result } from '../shared/result';
import type { GeminiClient, GenerateOptions } from './types';
import { DEFAULT_MODEL } from './models';

export function createGeminiClient(
  apiKey: string,
  defaultModel = DEFAULT_MODEL
): GeminiClient {
  const client = new GoogleGenAI({ apiKey });

  return {
    generate: async <T extends z.ZodType>(
      prompt: string,
      schema: T,
      options?: GenerateOptions
    ): Promise<Result<z.infer<T>>> => {
      try {
        const response = await client.models.generateContent({
          model: options?.model ?? defaultModel,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: z.toJSONSchema(schema, { target: 'openapi-3.0' }),
            temperature: options?.temperature ?? 0.2,
          },
        });

        const text = response.text;
        if (!text) {
          return err({ code: 'EMPTY_RESPONSE', message: 'Gemini returned empty response' });
        }

        const parsed = schema.safeParse(JSON.parse(text));
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
        return err({ code: 'API_ERROR', message: String(e), cause: e });
      }
    },
  };
}
