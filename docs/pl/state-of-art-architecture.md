# Stargazer - Architektura State-of-the-Art

## Podsumowanie

Refaktoryzacja architektury z class-based na **100% podejście funkcyjne** z Tagged Unions, prostym systemem pluginów (styl Vite) i Zod 4.

**Zakres**: MVP na hackathon (Core + CLI + Action)
**Licencja**: Pełne MIT open source
**Monetyzacja**: Hosting-as-a-Service + Usage-based billing (w przyszłości)

---

## Kluczowe decyzje architektoniczne

| Decyzja | Wybór | Uzasadnienie |
|---------|-------|--------------|
| Obsługa błędów | Tagged Unions (`Result<T, E>`) | Bez klas, natywne dla TypeScript, jawne |
| System pluginów | Proste hooki (styl Vite) | Łatwe do contribute, pokrywa 90% przypadków |
| Walidacja | Zod 4 | Natywne `z.toJSONSchema()` z `target: 'openapi-3.0'` |
| Zarządzanie stanem | Closures | Bez klas, jawne zależności |
| Wzorzec modułowy | Factory functions | `createX()` zwraca obiekt interfejsu |
| Monorepo | pnpm + Turborepo + tsup | Standard 2025, szybkie buildy |
| Rozwiązywanie modułów | Tryb `bundler` | Czyste importy bez rozszerzeń `.js` |
| Organizacja modułów | **BEZ wewnętrznych barrel files** | Tylko bezpośrednie importy, wg TkDodo |

---

## 1. Wzorzec obsługi błędów (Tagged Unions)

### Problem z klasami
```typescript
// STARE (oparte na klasach) - NIE RÓB TEGO
class StargazerError extends Error {
  constructor(public code: string, message: string) { ... }
}
throw new StargazerError('API_ERROR', 'Failed');
```

### Nowe podejście (Tagged Unions)
```typescript
// NOWE (funkcyjne) - RÓB TO
// packages/core/src/shared/result.ts

export type Result<T, E = StargazerError> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: E };

export type StargazerError = {
  readonly code: ErrorCode;
  readonly message: string;
  readonly cause?: unknown;
};

export type ErrorCode =
  | 'API_ERROR'           // Błąd API Gemini
  | 'SCHEMA_VALIDATION'   // Walidacja Zod nie powiodła się
  | 'CONFIG_INVALID'      // Nieprawidłowa konfiguracja
  | 'GIT_ERROR'           // Operacja Git nie powiodła się
  | 'RATE_LIMITED'        // Limit API (429)
  | 'UNAUTHORIZED'        // Nieprawidłowy klucz API (401)
  | 'BAD_REQUEST'         // Nieprawidłowe żądanie (400)
  | 'EMPTY_RESPONSE'      // API zwróciło pustą odpowiedź
  | 'TIMEOUT'             // Przekroczono limit czasu
  | 'FILE_NOT_FOUND';     // Plik nie istnieje

// Funkcje pomocnicze
export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
export const isOk = <T, E>(r: Result<T, E>): r is { ok: true; data: T } => r.ok;
export const isErr = <T, E>(r: Result<T, E>): r is { ok: false; error: E } => !r.ok;
```

### Przykład użycia
```typescript
async function callGemini(): Promise<Result<ReviewResult>> {
  try {
    const response = await client.generateContent(...);
    return ok(response);
  } catch (e) {
    return err({ code: 'API_ERROR', message: String(e), cause: e });
  }
}

// Konsument - jawna obsługa
const result = await callGemini();
if (!result.ok) {
  console.error(result.error.message);
  return;
}
console.log(result.data); // TypeScript wie, że to ReviewResult
```

---

## 2. System pluginów (proste hooki w stylu Vite)

### Problem ze złożonymi systemami
```typescript
// STARE (zbyt skomplikowane) - NIE RÓB TEGO
interface Plugin {
  setup?: (context: PluginContext) => Promise<void>;
  rules?: RuleDefinition[];
  analyzers?: AnalyzerDefinition[];
  hooks?: Partial<PluginHooks>;
}
// + PluginRegistry + HookRunner + łańcuchy...
```

### Nowe podejście (styl Vite)
```typescript
// NOWE (proste) - RÓB TO
// packages/core/src/plugins/types.ts

export interface StargazerPlugin {
  readonly name: string;

  // Opcjonalne hooki - po prostu funkcje
  readonly beforeReview?: (ctx: ReviewContext) => ReviewContext | Promise<ReviewContext>;
  readonly afterReview?: (result: ReviewResult, ctx: ReviewContext) => ReviewResult | Promise<ReviewResult>;
  readonly filterIssues?: (issues: Issue[]) => Issue[];
  readonly beforeDiscovery?: (files: FileContext[]) => FileContext[];
  readonly afterDiscovery?: (conventions: ProjectConventions) => ProjectConventions;
}

// Plugin to po prostu funkcja zwracająca obiekt
export type PluginFactory<T = void> = (options?: T) => StargazerPlugin;
```

### Przykładowy plugin
```typescript
export const ignorePathsPlugin: PluginFactory<{ paths: string[] }> = (options) => ({
  name: 'ignore-paths',
  filterIssues: (issues) =>
    issues.filter(i => !options?.paths.some(p => i.file.includes(p))),
});

// Użycie w konfiguracji
export default defineConfig({
  plugins: [
    ignorePathsPlugin({ paths: ['/legacy/', '/generated/'] }),
  ],
});
```

### Hook Runner (uproszczony)
```typescript
// packages/core/src/plugins/hooks.ts

export async function runHooks<T>(
  plugins: StargazerPlugin[],
  hookName: keyof StargazerPlugin,
  initialValue: T,
  ...args: unknown[]
): Promise<T> {
  let result = initialValue;

  for (const plugin of plugins) {
    const hook = plugin[hookName] as Function | undefined;
    if (hook) {
      result = await hook(result, ...args);
    }
  }

  return result;
}
```

---

## 3. Integracja Zod 4

### Migracja z Zod 3
```typescript
// STARE (Zod 3 + adapter) - NIE RÓB TEGO
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
const schema = zodToJsonSchema(IssueSchema);

// NOWE (natywne Zod 4) - RÓB TO
import * as z from 'zod/v4';

export const IssueSchema = z.object({
  id: z.string().describe('Unikalny identyfikator'),
  file: z.string().describe('Ścieżka pliku'),
  line: z.int().positive().describe('Numer linii'),  // z.int() w Zod 4
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.enum(['bug', 'security', 'convention', 'performance']),
  message: z.string().describe('Opis problemu'),
  suggestion: z.string().optional().describe('Sugerowana poprawka'),
  conventionRef: z.string().optional().describe('Referencja do konwencji'),
  confidence: z.number().min(0).max(1).describe('Pewność 0-1'),
}).describe('Pojedynczy problem w code review');

// KRYTYCZNE: Użyj target OpenAPI 3.0 dla kompatybilności z Gemini API
const jsonSchema = z.toJSONSchema(IssueSchema, { target: 'openapi-3.0' });
```

---

## 4. Struktura plików (BEZ wewnętrznych barrel files!)

**Badania pokazują, że organizacja feature-based jest state-of-the-art**, ale **BEZ wewnętrznych barrel files** zgodnie z [best practice TkDodo](https://tkdodo.eu/blog/please-stop-using-barrel-files).

```
stargazer/
├── package.json                  # root workspace pnpm
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── LICENSE                       # MIT
├── README.md
│
├── packages/
│   │
│   ├── core/                     # @stargazer/core
│   │   ├── package.json
│   │   ├── tsup.config.ts
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts          # JEDYNY PUBLICZNY BARREL
│   │       │
│   │       ├── shared/           # BEZ index.ts!
│   │       │   ├── result.ts     # Result<T,E>, ok(), err()
│   │       │   ├── types.ts      # Logger, wspólne typy
│   │       │   └── errors.ts     # Typ ErrorCode
│   │       │
│   │       ├── gemini/           # BEZ index.ts!
│   │       │   ├── client.ts     # createGeminiClient()
│   │       │   ├── models.ts     # Stała MODELS
│   │       │   └── types.ts      # Interfejs GeminiClient
│   │       │
│   │       ├── review/           # BEZ index.ts!
│   │       │   ├── engine.ts     # createReviewEngine()
│   │       │   ├── filter.ts     # filterIssues()
│   │       │   ├── prompts.ts    # buildReviewPrompt()
│   │       │   ├── types.ts      # ReviewResult, Issue
│   │       │   └── schemas.ts    # Schematy Zod
│   │       │
│   │       ├── conventions/      # BEZ index.ts!
│   │       │   ├── discovery.ts  # discoverConventions()
│   │       │   ├── cache.ts      # loadConventions()
│   │       │   ├── types.ts      # ProjectConventions
│   │       │   └── schemas.ts    # Schematy Zod
│   │       │
│   │       ├── context/          # BEZ index.ts!
│   │       │   ├── selector.ts   # selectContext()
│   │       │   ├── git.ts        # getDiff()
│   │       │   └── types.ts      # FileContext
│   │       │
│   │       ├── plugins/          # BEZ index.ts!
│   │       │   ├── hooks.ts      # runHooks()
│   │       │   └── types.ts      # StargazerPlugin
│   │       │
│   │       ├── config/           # BEZ index.ts!
│   │       │   ├── define.ts     # defineConfig()
│   │       │   ├── resolve.ts    # resolveConfig()
│   │       │   ├── defaults.ts   # DEFAULT_CONFIG
│   │       │   └── types.ts      # StargazerConfig
│   │       │
│   │       └── stargazer.ts      # createStargazer() fasada
│   │
│   ├── cli/                      # @stargazer/cli
│   │   └── src/
│   │       ├── index.ts          # Wejście CLI
│   │       ├── commands/         # BEZ index.ts!
│   │       │   ├── review.ts
│   │       │   ├── discover.ts
│   │       │   └── init.ts
│   │       └── output/           # BEZ index.ts!
│   │           ├── terminal.ts
│   │           ├── json.ts
│   │           └── markdown.ts
│   │
│   └── action/                   # @stargazer/action
│       └── src/
│           ├── index.ts          # Wejście Action
│           ├── handlers/         # BEZ index.ts!
│           │   ├── pr.ts
│           │   └── comment.ts
│           └── github/           # BEZ index.ts!
│               ├── client.ts
│               ├── review.ts
│               └── diff.ts
│
└── docs/
    ├── en/                       # Dokumentacja angielska
    └── pl/                       # Dokumentacja polska
```

### Zasady importów

```typescript
// POPRAWNIE - bezpośrednie importy
import { ok, err } from '../shared/result';
import type { GeminiClient } from '../gemini/types';
import { createReviewEngine } from '../review/engine';

// BŁĘDNIE - importy przez barrel (NIE RÓB TEGO!)
import { ok, err, GeminiClient } from '../shared';
import { createReviewEngine } from '../review';
```

**Dlaczego bez wewnętrznych barrel files?**
- Eliminuje ryzyko cyklicznych importów
- Lepszy tree shaking (68% mniej załadowanych modułów)
- Szybsza kompilacja TypeScript
- Czytelniejszy graf zależności

---

## 5. Klient Gemini (wzorzec funkcyjny)

```typescript
// packages/core/src/gemini/client.ts

import { GoogleGenAI, ApiError } from '@google/genai';
import * as z from 'zod/v4';
import { ok, err } from '../shared/result';       // bezpośredni import!
import type { Result } from '../shared/result';
import type { GeminiClient, GenerateOptions } from './types';

export function createGeminiClient(
  apiKey: string,
  defaultModel = 'gemini-2.0-flash'
): GeminiClient {
  const client = new GoogleGenAI({ apiKey });

  return {
    async generate<T extends z.ZodType>(
      prompt: string,
      schema: T,
      options?: GenerateOptions
    ): Promise<Result<z.infer<T>>> {
      try {
        const response = await client.models.generateContent({
          model: options?.model ?? defaultModel,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            // KRYTYCZNE: Użyj responseJsonSchema z target OpenAPI 3.0
            responseJsonSchema: z.toJSONSchema(schema, { target: 'openapi-3.0' }),
            temperature: options?.temperature ?? 0.2,
          },
        });

        const parsed = schema.safeParse(JSON.parse(response.text ?? ''));
        if (!parsed.success) {
          return err({ code: 'SCHEMA_VALIDATION', message: parsed.error.message });
        }
        return ok(parsed.data);
      } catch (e) {
        if (e instanceof ApiError && e.status === 429) {
          return err({ code: 'RATE_LIMITED', message: e.message, cause: e });
        }
        return err({ code: 'API_ERROR', message: String(e), cause: e });
      }
    },

    async countTokens(content: string): Promise<number> {
      const response = await client.models.countTokens({
        model: defaultModel,
        contents: content,
      });
      return response.totalTokens ?? 0;
    },
  };
}
```

---

## 6. Konfiguracja TypeScript (tryb Bundler)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,

    "declaration": true,
    "declarationMap": true,

    "noEmit": true
  }
}
```

**Korzyści trybu bundler:**
- Czyste importy bez rozszerzeń `.js`
- TypeScript tylko sprawdza typy, tsup obsługuje bundling
- Podwójne wyjście ESM/CJS dla kompatybilności

---

## 7. Publiczne API (jedyny barrel)

```typescript
// packages/core/src/index.ts
// JEDYNY PUBLICZNY BARREL - bezpośrednie importy z konkretnych plików

// Typ Result
export { ok, err, isOk, isErr } from './shared/result';
export type { Result, StargazerError, ErrorCode } from './shared/result';

// Review
export type { ReviewResult, Issue, IssueSeverity } from './review/types';
export { IssueSchema, ReviewResultSchema } from './review/schemas';
export { createReviewEngine } from './review/engine';

// Konwencje
export type { ProjectConventions } from './conventions/types';
export { discoverConventions } from './conventions/discovery';
export { loadConventions, saveConventions } from './conventions/cache';

// Pluginy (styl Vite)
export type { StargazerPlugin, PluginFactory } from './plugins/types';
export { runHooks } from './plugins/hooks';

// Konfiguracja
export type { StargazerConfig, ResolvedConfig } from './config/types';
export { defineConfig } from './config/define';

// Klient Gemini
export { createGeminiClient } from './gemini/client';
export type { GeminiClient } from './gemini/types';

// Główna fasada
export { createStargazer } from './stargazer';
export type { Stargazer, StargazerOptions } from './stargazer';
```

---

## 8. Kluczowe różnice od poprzedniej architektury

| Poprzednie | Nowe |
|------------|------|
| `class StargazerError extends Error` | `type StargazerError = { code, message, cause }` |
| `class GeminiClient` | `createGeminiClient()` factory function |
| `class Stargazer` | `createStargazer()` factory function |
| Wewnętrzne barrel files (`index.ts` w folderach) | BEZ wewnętrznych barrels - tylko bezpośrednie importy |
| `responseSchema` dla Gemini | `responseJsonSchema` z target OpenAPI 3.0 |
| `z.toJSONSchema(schema)` | `z.toJSONSchema(schema, { target: 'openapi-3.0' })` |
| Złożony PluginRegistry | Proste hooki w stylu Vite |
| Rozszerzenia `.js` w importach | Czyste importy (tryb bundler) |
| `import { z } from 'zod'` | `import * as z from 'zod/v4'` |

---

## Źródła

### Architektura i wzorce
- [TkDodo - Please Stop Using Barrel Files](https://tkdodo.eu/blog/please-stop-using-barrel-files)
- [Vite Plugin API](https://vite.dev/guide/api-plugin)
- [TypeScript Result Types](https://typescript.tv/best-practices/error-handling-with-result-types/)

### Build i narzędzia
- [Turborepo - Structuring Repository](https://turborepo.com/docs/crafting-your-repository/structuring-a-repository)
- [TypeScript Bundler Mode](https://www.typescriptlang.org/tsconfig/moduleResolution.html)

### API i biblioteki
- [Zod 4 JSON Schema](https://zod.dev/json-schema)
- [Gemini API Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Google GenAI JS SDK](https://github.com/googleapis/js-genai)
