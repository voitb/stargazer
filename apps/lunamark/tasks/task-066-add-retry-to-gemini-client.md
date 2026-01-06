---
id: task-066
title: Add retry to Gemini client
status: todo
assignee: voitb
priority: medium
labels:
  - core
  - gemini
created: '2026-01-01'
order: 660
---
## Description

Integrate retry logic into the Gemini client for rate limit handling.

## Acceptance Criteria

- [ ] Update `packages/core/src/gemini/client.ts`
- [ ] Wrap API calls with withRetry
- [ ] Log retry attempts
- [ ] Configurable retry options

## Implementation

**File**: `packages/core/src/gemini/client.ts` (update generate method)

```typescript
import { GoogleGenAI } from '@google/genai';
import * as z from 'zod/v4';
import { ok, err } from '../shared/result';
import { withRetry } from '../shared/retry';
import type { Result } from '../shared/result';
import type { GeminiClient, GenerateOptions } from './types';
import { DEFAULT_MODEL } from './models';

export type GeminiClientOptions = {
  /** Enable retry on rate limit (default: true) */
  enableRetry?: boolean;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay for retry in ms (default: 1000) */
  retryDelay?: number;
};

export function createGeminiClient(
  apiKey: string,
  defaultModel = DEFAULT_MODEL,
  options: GeminiClientOptions = {}
): GeminiClient {
  const {
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
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
            return err({
              code: 'EMPTY_RESPONSE',
              message: 'Gemini returned empty response',
            });
          }

          const parsed = schema.safeParse(JSON.parse(text));
          if (!parsed.success) {
            return err({
              code: 'SCHEMA_VALIDATION',
              message: parsed.error.message,
            });
          }

          return ok(parsed.data);
        } catch (e) {
          // Check for rate limit error
          if (isRateLimitError(e)) {
            return err({
              code: 'RATE_LIMITED',
              message: 'Rate limit exceeded',
              cause: e,
            });
          }

          return err({
            code: 'API_ERROR',
            message: String(e),
            cause: e,
          });
        }
      };

      // Apply retry logic if enabled
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

function isRateLimitError(e: unknown): boolean {
  if (e instanceof Error) {
    // Check for 429 status or rate limit message
    const message = e.message.toLowerCase();
    return (
      message.includes('429') ||
      message.includes('rate limit') ||
      message.includes('quota exceeded') ||
      message.includes('too many requests')
    );
  }
  return false;
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
