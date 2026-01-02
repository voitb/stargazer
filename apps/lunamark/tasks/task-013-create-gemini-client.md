---
id: task-013
title: Create createGeminiClient factory
status: todo
priority: high
labels:
  - core
  - gemini
created: '2026-01-01'
order: 70
---
## Description

Create the Gemini client factory function with structured output support.

## Acceptance Criteria

- [ ] Create `packages/core/src/gemini/client.ts`
- [ ] Implement `createGeminiClient()` factory
- [ ] Use `responseJsonSchema` with OpenAPI 3.0 target
- [ ] Handle API errors: 429, 401, empty response
- [ ] Return `Result<T>` for all outcomes

## Implementation

**File**: `packages/core/src/gemini/client.ts`

```typescript
import { GoogleGenAI } from '@google/genai';
import * as z from 'zod/v4';
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
          return err({ code: 'SCHEMA_VALIDATION', message: parsed.error.message });
        }

        return ok(parsed.data);
      } catch (e) {
        return err({ code: 'API_ERROR', message: String(e), cause: e });
      }
    },
  };
}
```

## Test

TypeScript compiles without errors.
