---
id: task-086
title: Add API timeout configuration
status: done
priority: medium
labels:
  - core
  - gemini
created: '2026-01-06'
order: 860
assignee: voitb
---
## Description

Add timeout configuration for Gemini API calls to prevent indefinite hanging.

## Issue Details

**File**: `/packages/core/src/gemini/client.ts`
**Confidence**: 83%
**Category**: Reliability

There's no timeout configuration for API calls. Large diffs could cause requests to hang indefinitely.

## Acceptance Criteria

- [x] Add `timeout` option to `GeminiClientOptions`
- [x] Use `AbortController` for timeout implementation
- [x] Default to 60 seconds timeout
- [x] Return structured error on timeout

## Implementation

**File**: `packages/core/src/gemini/types.ts`

```typescript
export type GeminiClientOptions = {
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  /** Request timeout in milliseconds (default: 60000) */
  timeout?: number;
};
```

**File**: `packages/core/src/gemini/client.ts`

```typescript
export function createGeminiClient(
  apiKey: string,
  defaultModel = DEFAULT_MODEL,
  options: GeminiClientOptions = {}
): GeminiClient {
  const {
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 60000, // 60 seconds default
  } = options;

  // ...

  const doGenerate = async (): Promise<Result<z.infer<T>>> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await client.models.generateContent({
        model: generateOptions?.model ?? defaultModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: z.toJSONSchema(schema, { target: 'openapi-3.0' }),
          temperature: generateOptions?.temperature ?? 0.2,
        },
        // Pass abort signal if supported by the SDK
      });

      clearTimeout(timeoutId);
      // ... rest of implementation
    } catch (e) {
      clearTimeout(timeoutId);

      if (e instanceof Error && e.name === 'AbortError') {
        return err({
          code: 'API_ERROR',
          message: `Request timed out after ${timeout}ms`,
        });
      }

      // ... rest of error handling
    }
  };
}
```

## Test

```bash
cd packages/core && pnpm test client.test.ts
```
