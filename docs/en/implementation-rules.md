# Stargazer Implementation Rules

> **For AI Agents**: Follow these rules EXACTLY when writing code for Stargazer.

## Quick Reference

| Rule | DO | DON'T |
|------|-----|-------|
| Error Handling | `Result<T, E>` | `throw` / `try-catch` |
| Classes | `createX()` factory | `class X {}` |
| Imports | `'../shared/result'` | `'../shared'` (barrel) |
| Zod | `import * as z from 'zod/v4'` | `import { z } from 'zod'` |
| Gemini | `responseJsonSchema` | `responseSchema` |
| Types | `readonly` properties | mutable interfaces |

---

## 1. Error Handling (Result Pattern)

### MUST

- ✅ ALWAYS return `Result<T, E>` from functions that can fail
- ✅ ALWAYS use `ok()` and `err()` helpers
- ✅ ALWAYS check `result.ok` before accessing `result.data`

### NEVER

- ❌ NEVER throw exceptions in library code
- ❌ NEVER use try-catch for control flow (only for catching SDK errors)
- ❌ NEVER return `null` or `undefined` for errors

### Code Example

```typescript
import { ok, err } from '../shared/result';
import type { Result, StargazerError } from '../shared/result';

// ❌ WRONG - throws exception
async function getData(): Promise<Data> {
  throw new Error('Failed to fetch');
}

// ✅ CORRECT - returns Result
async function getData(): Promise<Result<Data>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return err({ code: 'API_ERROR', message: `HTTP ${response.status}` });
    }
    return ok(await response.json());
  } catch (e) {
    return err({ code: 'API_ERROR', message: String(e), cause: e });
  }
}

// ✅ CORRECT - consuming Result
const result = await getData();
if (!result.ok) {
  console.error(result.error.message);
  return;
}
// TypeScript knows result.data is Data here
console.log(result.data);
```

---

## 2. No Classes (Factory Functions)

### MUST

- ✅ ALWAYS use factory functions: `createX()`
- ✅ ALWAYS return interface objects (not class instances)
- ✅ ALWAYS use closures for private state

### NEVER

- ❌ NEVER use `class` keyword
- ❌ NEVER use `this`
- ❌ NEVER use `new` for your own types

### Code Example

```typescript
// ❌ WRONG - class-based
class GeminiClient {
  private client: GoogleGenAI;

  constructor(private apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(prompt: string): Promise<string> {
    return this.client.models.generateContent({ ... });
  }
}

// ✅ CORRECT - factory function
export interface GeminiClient {
  readonly generate: <T extends z.ZodType>(
    prompt: string,
    schema: T
  ) => Promise<Result<z.infer<T>>>;
}

export function createGeminiClient(apiKey: string): GeminiClient {
  // Private state via closure (no `this`)
  const client = new GoogleGenAI({ apiKey });

  return {
    generate: async (prompt, schema) => {
      // Use `client` from closure
      const response = await client.models.generateContent({ ... });
      return ok(response);
    },
  };
}
```

---

## 3. No Barrel Files (Direct Imports)

### MUST

- ✅ ALWAYS import directly: `'../shared/result'`
- ✅ ONLY ONE barrel at `src/index.ts` (public API)
- ✅ ALWAYS use explicit file paths

### NEVER

- ❌ NEVER create `index.ts` inside feature folders
- ❌ NEVER import from folder paths: `'../shared'`
- ❌ NEVER re-export everything from a single file

### Code Example

```typescript
// ❌ WRONG - barrel imports
import { ok, err, createGeminiClient, GeminiClient } from '../shared';
import { IssueSchema, ReviewResultSchema } from '../review';

// ✅ CORRECT - direct imports
import { ok, err } from '../shared/result';
import type { Result } from '../shared/result';
import { createGeminiClient } from '../gemini/client';
import type { GeminiClient } from '../gemini/types';
import { IssueSchema } from '../review/schemas';
import type { Issue } from '../review/types';
```

### File Structure

```
src/
├── index.ts              # ✅ ONLY public barrel
├── shared/               # ❌ NO index.ts here!
│   ├── result.ts
│   └── types.ts
├── gemini/               # ❌ NO index.ts here!
│   ├── client.ts
│   └── types.ts
└── review/               # ❌ NO index.ts here!
    ├── engine.ts
    ├── schemas.ts
    └── types.ts
```

---

## 4. Zod Schemas

### MUST

- ✅ ALWAYS import as `import * as z from 'zod/v4'`
- ✅ ALWAYS use `.describe()` for ALL schema fields
- ✅ ALWAYS use `z.int()` for integers
- ✅ ALWAYS use `z.toJSONSchema(schema, { target: 'openapi-3.0' })` for Gemini

### NEVER

- ❌ NEVER use `import { z } from 'zod'` (wrong for v4)
- ❌ NEVER skip `.describe()` on fields
- ❌ NEVER use `z.number().int()` (use `z.int()` instead)

### Code Example

```typescript
import * as z from 'zod/v4';

// ✅ CORRECT - full schema with descriptions
export const IssueSchema = z.object({
  id: z.string().describe('Unique identifier for this issue'),
  file: z.string().describe('Relative path to the file'),
  line: z.int().positive().describe('Line number in the file'),
  severity: z.enum(['critical', 'high', 'medium', 'low']).describe('Issue severity level'),
  category: z.enum(['bug', 'security', 'convention', 'performance']).describe('Issue category'),
  message: z.string().describe('Clear description of the issue'),
  suggestion: z.string().optional().describe('Suggested code fix'),
  confidence: z.number().min(0).max(1).describe('Confidence score 0-1'),
}).describe('A single code review issue');

// Infer type from schema
export type Issue = z.infer<typeof IssueSchema>;

// Convert for Gemini API - ALWAYS use OpenAPI 3.0 target
export const IssueJSONSchema = z.toJSONSchema(IssueSchema, {
  target: 'openapi-3.0'
});
```

---

## 5. Gemini API

### MUST

- ✅ ALWAYS use `responseJsonSchema` (not `responseSchema`)
- ✅ ALWAYS set `responseMimeType: 'application/json'`
- ✅ ALWAYS validate response with Zod `.safeParse()` after JSON.parse
- ✅ ALWAYS handle rate limiting (429) explicitly

### NEVER

- ❌ NEVER use `responseSchema` (use `responseJsonSchema`)
- ❌ NEVER trust raw response without validation
- ❌ NEVER ignore empty responses

### Code Example

```typescript
import { GoogleGenAI, ApiError } from '@google/genai';
import * as z from 'zod/v4';
import { ok, err } from '../shared/result';

async function generate<T extends z.ZodType>(
  client: GoogleGenAI,
  prompt: string,
  schema: T
): Promise<Result<z.infer<T>>> {
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        // ✅ CORRECT configuration
        responseMimeType: 'application/json',
        responseJsonSchema: z.toJSONSchema(schema, { target: 'openapi-3.0' }),
        temperature: 0.2,
      },
    });

    // ✅ ALWAYS check for empty response
    const text = response.text;
    if (!text) {
      return err({ code: 'EMPTY_RESPONSE', message: 'Gemini returned empty response' });
    }

    // ✅ ALWAYS validate with Zod
    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success) {
      return err({ code: 'SCHEMA_VALIDATION', message: parsed.error.message });
    }

    return ok(parsed.data);
  } catch (e) {
    // ✅ ALWAYS handle rate limiting explicitly
    if (e instanceof ApiError && e.status === 429) {
      return err({ code: 'RATE_LIMITED', message: e.message, cause: e });
    }
    return err({ code: 'API_ERROR', message: String(e), cause: e });
  }
}
```

---

## 6. Type Safety

### MUST

- ✅ ALWAYS use `readonly` for interface properties
- ✅ ALWAYS use `as const` for literal arrays/objects
- ✅ ALWAYS narrow types before using them
- ✅ ALWAYS use `unknown` if type is truly unknown

### NEVER

- ❌ NEVER use `any`
- ❌ NEVER use type assertions (`as X`) without validation
- ❌ NEVER ignore TypeScript errors with `@ts-ignore`

### Code Example

```typescript
// ✅ CORRECT - readonly properties
export interface StargazerConfig {
  readonly apiKey: string;
  readonly model: Model;
  readonly minSeverity: Severity;
}

// ✅ CORRECT - const assertions
const MODELS = ['gemini-2.0-flash', 'gemini-2.0-pro'] as const;
type Model = typeof MODELS[number];

const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
type Severity = typeof SEVERITIES[number];

// ✅ CORRECT - type narrowing
function processResult(result: Result<Data>): void {
  if (!result.ok) {
    // TypeScript knows result.error exists
    console.error(result.error.message);
    return;
  }
  // TypeScript knows result.data exists
  console.log(result.data);
}

// ❌ WRONG - using any
function process(data: any) { ... }

// ✅ CORRECT - using unknown with validation
function process(data: unknown): Result<Data> {
  const parsed = DataSchema.safeParse(data);
  if (!parsed.success) {
    return err({ code: 'SCHEMA_VALIDATION', message: parsed.error.message });
  }
  return ok(parsed.data);
}
```

---

## 7. Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Functions | camelCase | `createGeminiClient`, `filterIssues` |
| Types/Interfaces | PascalCase | `GeminiClient`, `ReviewResult` |
| Constants | SCREAMING_SNAKE_CASE | `DEFAULT_MODEL`, `MAX_RETRIES` |
| Files | kebab-case.ts | `gemini-client.ts`, `review-engine.ts` |
| Folders | kebab-case | `shared/`, `review/` |

### Code Example

```typescript
// ✅ CORRECT naming
// File: src/gemini/client.ts

import type { GeminiClient, GenerateOptions } from './types';

const DEFAULT_MODEL = 'gemini-2.0-flash';
const MAX_RETRIES = 3;

export function createGeminiClient(apiKey: string): GeminiClient {
  // ...
}
```

---

## 8. Async/Await

### MUST

- ✅ ALWAYS use async/await (never raw Promises with `.then()`)
- ✅ ALWAYS return `Promise<Result<T>>` for async operations
- ✅ ALWAYS handle errors within async functions

### NEVER

- ❌ NEVER use `.then().catch()` chains
- ❌ NEVER leave promises unhandled
- ❌ NEVER use callbacks for async operations

### Code Example

```typescript
// ❌ WRONG - Promise chains
function fetchData(): Promise<Data> {
  return fetch(url)
    .then(res => res.json())
    .then(data => processData(data))
    .catch(err => { throw err; });
}

// ✅ CORRECT - async/await with Result
async function fetchData(): Promise<Result<Data>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return err({ code: 'API_ERROR', message: `HTTP ${response.status}` });
    }
    const data = await response.json();
    return ok(processData(data));
  } catch (e) {
    return err({ code: 'API_ERROR', message: String(e), cause: e });
  }
}
```

---

## 9. Exports

### MUST

- ✅ ALWAYS use named exports
- ✅ ALWAYS export types separately with `export type`
- ✅ ALWAYS co-locate type exports with their implementations

### NEVER

- ❌ NEVER use default exports
- ❌ NEVER use `export default`
- ❌ NEVER use `require()`

### Code Example

```typescript
// ❌ WRONG - default export
export default function createClient() { ... }

// ✅ CORRECT - named exports
export function createGeminiClient(apiKey: string): GeminiClient { ... }

export type { GeminiClient, GenerateOptions } from './types';
```

---

## 10. Error Codes

Use these standardized error codes:

```typescript
export type ErrorCode =
  | 'API_ERROR'           // Gemini API call failed
  | 'SCHEMA_VALIDATION'   // Zod validation failed
  | 'CONFIG_INVALID'      // Invalid configuration
  | 'GIT_ERROR'           // Git operation failed
  | 'RATE_LIMITED'        // API rate limit hit (429)
  | 'UNAUTHORIZED'        // API key invalid (401)
  | 'BAD_REQUEST'         // Malformed request (400)
  | 'EMPTY_RESPONSE'      // API returned empty response
  | 'TIMEOUT'             // Request timed out
  | 'FILE_NOT_FOUND';     // File doesn't exist
```

---

## NEVER Do Checklist

1. ❌ NEVER use `console.log` in library code (only in CLI)
2. ❌ NEVER mutate function arguments
3. ❌ NEVER use default exports
4. ❌ NEVER use `require()` (use ES imports)
5. ❌ NEVER use string concatenation for prompts (use template literals)
6. ❌ NEVER hardcode API keys (use environment variables)
7. ❌ NEVER use `@ts-ignore` or `@ts-expect-error`
8. ❌ NEVER use `any` type
9. ❌ NEVER throw exceptions in library code
10. ❌ NEVER create index.ts barrel files in feature folders

---

## Quick Checklist Before Committing

- [ ] All functions that can fail return `Result<T, E>`
- [ ] No classes, only factory functions
- [ ] No barrel imports (direct file paths only)
- [ ] All Zod schema fields have `.describe()`
- [ ] Gemini uses `responseJsonSchema` with OpenAPI 3.0 target
- [ ] All interface properties are `readonly`
- [ ] No `any` types
- [ ] Named exports only (no default exports)
- [ ] Consistent naming conventions
- [ ] All async functions use async/await
