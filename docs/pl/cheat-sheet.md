# Ściągawka Stargazer

> Jednostronicowa szybka referencja do implementacji Stargazer.

---

## Szybka Konfiguracja

```bash
# Instalacja zależności
pnpm add @google/genai zod

# Ustaw klucz API
export GEMINI_API_KEY=twoj-klucz-tutaj
```

---

## Główne Wzorce

### Typ Result

```typescript
import { ok, err } from './shared/result';
import type { Result, ApiError } from './shared/result';

// Definicja
type Result<T, E = ApiError> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: E };

// Helpery
const ok = <T>(data: T) => ({ ok: true, data });
const err = <E>(error: E) => ({ ok: false, error });

// Użycie
async function doSomething(): Promise<Result<Data>> {
  if (failed) return err({ code: 'API_ERROR', message: 'Nie powiodło się' });
  return ok(data);
}

const result = await doSomething();
if (!result.ok) return; // Obsłuż błąd
console.log(result.data); // TypeScript wie, że to Data
```

### Factory Functions

```typescript
// Wzorzec: createX() zwraca interfejs
function createGeminiClient(apiKey: string): GeminiClient {
  const client = new GoogleGenAI({ apiKey }); // Prywatne przez closure

  return {
    generate: async (prompt, schema) => { ... },
    countTokens: async (content) => { ... },
  };
}

// Użycie
const gemini = createGeminiClient(apiKey);
const result = await gemini.generate(prompt, Schema);
```

### Schematy Zod

```typescript
import * as z from 'zod/v4';

// Zdefiniuj schemat z .describe() na WSZYSTKICH polach
const IssueSchema = z.object({
  id: z.string().describe('Unikalny identyfikator'),
  file: z.string().describe('Ścieżka pliku'),
  line: z.int().positive().describe('Numer linii'), // z.int() nie z.number()
  severity: z.enum(['critical', 'high', 'medium', 'low']).describe('Ważność'),
  message: z.string().describe('Opis problemu'),
}).describe('Problem w code review');

// Wywnioskuj typ TypeScript
type Issue = z.infer<typeof IssueSchema>;

// Konwertuj do JSON Schema dla Gemini
const jsonSchema = z.toJSONSchema(IssueSchema, { target: 'openapi-3.0' });
```

### Wywołanie Gemini API

```typescript
import { GoogleGenAI } from '@google/genai';
import * as z from 'zod/v4';

const client = new GoogleGenAI({ apiKey });

const response = await client.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: prompt,
  config: {
    responseMimeType: 'application/json',
    responseJsonSchema: z.toJSONSchema(Schema, { target: 'openapi-3.0' }),
    temperature: 0.2,
  },
});

// Zawsze waliduj odpowiedź
const parsed = Schema.safeParse(JSON.parse(response.text ?? ''));
if (!parsed.success) return err({ code: 'SCHEMA_VALIDATION', message: parsed.error.message });
return ok(parsed.data);
```

---

## Wzorce Importów

```typescript
// ✅ DOBRZE - Bezpośrednie importy
import { ok, err } from '../shared/result';
import type { Result } from '../shared/result';
import { createGeminiClient } from '../gemini/client';
import type { GeminiClient } from '../gemini/types';
import { IssueSchema } from '../review/schemas';
import type { Issue } from '../review/types';

// ❌ ŹLE - Barrel imports
import { ok, err, createGeminiClient } from '../shared';
```

---

## Kluczowe Schematy

### Issue

```typescript
const IssueSchema = z.object({
  id: z.string(),
  file: z.string(),
  line: z.int().positive(),
  endLine: z.int().positive().optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.enum(['bug', 'security', 'convention', 'performance']),
  message: z.string(),
  suggestion: z.string().optional(),
  conventionRef: z.string().optional(),
  confidence: z.number().min(0).max(1),
});
```

### ReviewResult

```typescript
const ReviewResultSchema = z.object({
  summary: z.string(),
  decision: z.enum(['approve', 'request_changes', 'comment']),
  issues: z.array(IssueSchema),
  positives: z.array(z.string()).optional(),
});
```

### ProjectConventions

```typescript
const ProjectConventionsSchema = z.object({
  version: z.literal('1.0'),
  discoveredAt: z.string().datetime(),
  language: z.string(),
  patterns: z.object({
    errorHandling: ConventionPatternSchema.optional(),
    naming: ConventionPatternSchema.optional(),
    testing: ConventionPatternSchema.optional(),
    imports: ConventionPatternSchema.optional(),
  }),
  summary: z.string(),
});
```

---

## Kody Błędów

```typescript
type ErrorCode =
  | 'API_ERROR'           // Gemini API nie powiodło się
  | 'SCHEMA_VALIDATION'   // Walidacja Zod nie powiodła się
  | 'CONFIG_INVALID'      // Zła konfiguracja
  | 'GIT_ERROR'           // Operacja Git nie powiodła się
  | 'RATE_LIMITED'        // 429 limit zapytań
  | 'UNAUTHORIZED'        // 401 zły klucz API
  | 'BAD_REQUEST'         // 400 złe żądanie
  | 'EMPTY_RESPONSE'      // Pusta odpowiedź API
  | 'TIMEOUT'             // Przekroczono limit czasu
  | 'FILE_NOT_FOUND';     // Brak pliku
```

---

## Hooki Pluginów

```mermaid
graph LR
    A[beforeReview] --> B[AI Review]
    B --> C[filterIssues]
    C --> D[afterReview]
```

```typescript
interface StargazerPlugin {
  readonly name: string;
  readonly beforeReview?: (ctx: ReviewContext) => ReviewContext;
  readonly afterReview?: (result: ReviewResult, ctx: ReviewContext) => ReviewResult;
  readonly filterIssues?: (issues: Issue[]) => Issue[];
  readonly beforeDiscovery?: (files: FileContext[]) => FileContext[];
  readonly afterDiscovery?: (conventions: ProjectConventions) => ProjectConventions;
}

// Przykładowy plugin
const ignorePathsPlugin: PluginFactory<{ paths: string[] }> = (options) => ({
  name: 'ignore-paths',
  filterIssues: (issues) =>
    issues.filter(i => !options?.paths.some(p => i.file.includes(p))),
});
```

---

## Struktura Plików

```
packages/core/src/
├── index.ts                 # JEDYNY publiczny barrel
├── shared/                  # BEZ index.ts!
│   ├── result.ts           # Result<T,E>, ok(), err()
│   └── types.ts            # Wspólne typy
├── gemini/                  # BEZ index.ts!
│   ├── client.ts           # createGeminiClient()
│   └── types.ts            # Interfejs GeminiClient
├── review/                  # BEZ index.ts!
│   ├── engine.ts           # createReviewEngine()
│   ├── schemas.ts          # Schematy Zod
│   └── types.ts            # ReviewResult, Issue
├── conventions/             # BEZ index.ts!
│   ├── discovery.ts        # discoverConventions()
│   └── cache.ts            # loadConventions()
├── plugins/                 # BEZ index.ts!
│   ├── hooks.ts            # runHooks()
│   └── types.ts            # StargazerPlugin
├── config/                  # BEZ index.ts!
│   ├── define.ts           # defineConfig()
│   └── resolve.ts          # resolveConfig()
└── stargazer.ts            # createStargazer() fasada
```

---

## Szybkie Decyzje

| Pytanie | Odpowiedź |
|---------|-----------|
| Jak obsługiwać błędy? | `Result<T, E>` - nigdy nie rzucaj |
| Klasy czy funkcje? | Factory functions `createX()` |
| Pliki index w folderach? | NIE - tylko bezpośrednie importy |
| Import Zod? | `import * as z from 'zod/v4'` |
| Opcja schematu Gemini? | `responseJsonSchema` |
| Target JSON Schema? | `{ target: 'openapi-3.0' }` |
| Default exports? | NIE - tylko named exports |
| Typ `any`? | NIE - użyj `unknown` |
| `.then().catch()`? | NIE - użyj async/await |
| Mutowalne interfejsy? | NIE - użyj `readonly` |

---

## Typowe Snippety

### Tworzenie Błędu

```typescript
const createError = (code: ErrorCode, message: string, cause?: unknown): ApiError =>
  ({ code, message, cause });
```

### Retry z Backoff

```typescript
async function withRetry<T>(
  fn: () => Promise<Result<T>>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<Result<T>> {
  for (let i = 0; i < maxRetries; i++) {
    const result = await fn();
    if (result.ok || result.error.code !== 'RATE_LIMITED') return result;
    await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, i)));
  }
  return fn();
}
```

### Walidacja Konfiguracji

```typescript
const StargazerConfigSchema = z.object({
  apiKey: z.string().min(1, 'Klucz API wymagany'),
  model: z.enum(['gemini-2.0-flash', 'gemini-2.0-pro']).default('gemini-2.0-flash'),
  minSeverity: z.enum(['critical', 'high', 'medium', 'low']).default('high'),
  maxComments: z.number().int().positive().default(10),
});
```

---

## Linki

- [Zasady Implementacji](./implementation-rules.md) - Pełne zasady kodowania dla agentów AI
- [Architektura](./state-of-the-art-architecture.md) - Szczegółowe decyzje architektoniczne
- [Pluginy](./plugins.md) - Pisanie własnych pluginów
- [Szybki Start](./quick-start.md) - Przewodnik rozpoczęcia pracy
