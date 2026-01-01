# Architecture

> **TL;DR**: 100% functional (no classes), `Result<T, E>` for errors, Vite-style plugin hooks,
> Zod 4 with OpenAPI 3.0 target. For details, see [State-of-the-Art Architecture](./state-of-art-architecture.md).

Stargazer follows a **100% functional architecture** with modern TypeScript patterns.

## Core Principles

| Principle | Implementation |
|-----------|----------------|
| Error Handling | Tagged Unions (`Result<T, E>`) - no exceptions |
| Plugin System | Vite-style hooks - simple and composable |
| Module Organization | NO internal barrels - direct imports only |
| Validation | Zod 4 with `target: 'openapi-3.0'` |
| State | Closures - no classes |
| Factory Pattern | `createX()` returns interface objects |

## Package Structure

```
stargazer/
├── packages/
│   ├── core/           # @stargazer/core - Main library
│   ├── cli/            # @stargazer/cli - Command line tool
│   └── action/         # @stargazer/action - GitHub Action
└── docs/
    ├── en/             # English documentation
    └── pl/             # Polish documentation
```

## Result Pattern

We use Tagged Unions for explicit error handling instead of exceptions:

```typescript
// types/result.ts
export type Result<T, E = ApiError> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: E };

// Simple error type - no branded names
export type ApiError = {
  readonly code: ErrorCode;
  readonly message: string;
  readonly cause?: unknown;
};

// Helper functions
export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
```

### Usage

```typescript
async function reviewCode(): Promise<Result<ReviewResult>> {
  const result = await gemini.generate(prompt, schema);

  if (!result.ok) {
    return err({
      code: 'API_ERROR',
      message: 'Failed to generate review',
    });
  }

  return ok(result.data);
}

// Consumer handles both cases explicitly
const result = await reviewCode();
if (result.ok) {
  console.log(result.data); // TypeScript knows this is ReviewResult
} else {
  console.error(result.error.message);
}
```

## NO Internal Barrels

Following [TkDodo's best practice](https://tkdodo.eu/blog/please-stop-using-barrel-files), we avoid internal `index.ts` files:

```typescript
// CORRECT - direct imports
import { ok, err } from '../shared/result';
import type { GeminiClient } from '../gemini/types';

// WRONG - barrel imports
import { ok, err, GeminiClient } from '../shared';
```

**Why?**
- Eliminates circular import risks
- Better tree shaking
- 68% reduction in loaded modules during development

## Zod 4 with OpenAPI Target

For Gemini API compatibility, we use Zod 4's native JSON Schema conversion with the OpenAPI 3.0 target:

```typescript
import * as z from 'zod/v4';

const IssueSchema = z.object({
  id: z.string().describe('Unique identifier'),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  message: z.string().describe('Issue description'),
});

// For Gemini API - MUST use OpenAPI 3.0 target
const jsonSchema = z.toJSONSchema(IssueSchema, {
  target: 'openapi-3.0'
});
```

## Gemini Client

Functional wrapper around Google GenAI SDK:

```typescript
export function createGeminiClient(apiKey: string): GeminiClient {
  const client = new GoogleGenAI({ apiKey });

  return {
    async generate<T extends z.ZodType>(
      prompt: string,
      schema: T
    ): Promise<Result<z.infer<T>>> {
      try {
        const response = await client.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            // Use responseJsonSchema (not responseSchema!)
            responseJsonSchema: z.toJSONSchema(schema, {
              target: 'openapi-3.0'
            }),
          },
        });

        const parsed = schema.safeParse(JSON.parse(response.text ?? ''));
        if (!parsed.success) {
          return err({
            code: 'SCHEMA_VALIDATION',
            message: parsed.error.message
          });
        }
        return ok(parsed.data);
      } catch (e) {
        return err({ code: 'API_ERROR', message: String(e) });
      }
    },
  };
}
```

## Plugin System (Vite-Style)

Simple hook-based plugins that are easy to write and understand:

```typescript
export interface StargazerPlugin {
  readonly name: string;

  // Optional hooks
  readonly beforeReview?: (ctx: ReviewContext) => ReviewContext;
  readonly afterReview?: (result: ReviewResult) => ReviewResult;
  readonly filterIssues?: (issues: Issue[]) => Issue[];
}

// Plugin is just a function returning an object
export type PluginFactory<T> = (options?: T) => StargazerPlugin;

// Example plugin
export const ignorePathsPlugin: PluginFactory<{ paths: string[] }> = (options) => ({
  name: 'ignore-paths',
  filterIssues: (issues) =>
    issues.filter(i => !options?.paths.some(p => i.file.includes(p))),
});
```

## TypeScript Configuration

We use `bundler` mode for clean imports:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "noEmit": true
  }
}
```

**Benefits:**
- Clean imports without `.js` extensions
- TypeScript only type-checks, tsup handles bundling
- Dual ESM/CJS output for compatibility

## Build System

We use pnpm + Turborepo + tsup:

```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  target: 'es2022',
});
```

## Sources

- [TkDodo - Please Stop Using Barrel Files](https://tkdodo.eu/blog/please-stop-using-barrel-files)
- [Vite Plugin API](https://vite.dev/guide/api-plugin)
- [TypeScript Bundler Mode](https://www.typescriptlang.org/tsconfig/moduleResolution.html)
- [Zod 4 JSON Schema](https://zod.dev/json-schema)
- [Gemini API Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)
