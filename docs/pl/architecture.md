# Architektura

Stargazer stosuje **100% funkcyjną architekturę** z nowoczesnymi wzorcami TypeScript.

## Główne zasady

| Zasada | Implementacja |
|--------|---------------|
| Obsługa błędów | Tagged Unions (`Result<T, E>`) - bez wyjątków |
| System pluginów | Vite-style hooks - proste i komponowalne |
| Organizacja modułów | NO internal barrels - tylko direct imports |
| Walidacja | Zod 4 z `target: 'openapi-3.0'` |
| Stan | Closures - bez klas |
| Factory Pattern | `createX()` zwraca interface objects |

## Struktura pakietów

```
stargazer/
├── packages/
│   ├── core/           # @stargazer/core - Główna biblioteka
│   ├── cli/            # @stargazer/cli - Narzędzie CLI
│   └── action/         # @stargazer/action - GitHub Action
└── docs/
    ├── en/             # Dokumentacja angielska
    └── pl/             # Dokumentacja polska
```

## Result Pattern

Używamy Tagged Unions dla jawnej obsługi błędów zamiast wyjątków:

```typescript
// types/result.ts
export type Result<T, E = StargazerError> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: E };

export type StargazerError = {
  readonly code: ErrorCode;
  readonly message: string;
  readonly cause?: unknown;
};

// Helper functions
export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
```

### Użycie

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

// Konsument obsługuje oba przypadki jawnie
const result = await reviewCode();
if (result.ok) {
  console.log(result.data); // TypeScript wie, że to ReviewResult
} else {
  console.error(result.error.message);
}
```

## NO Internal Barrels

Zgodnie z [best practice TkDodo](https://tkdodo.eu/blog/please-stop-using-barrel-files), unikamy wewnętrznych `index.ts`:

```typescript
// PRAWIDŁOWO - direct imports
import { ok, err } from '../shared/result';
import type { GeminiClient } from '../gemini/types';

// NIEPRAWIDŁOWO - barrel imports
import { ok, err, GeminiClient } from '../shared';
```

**Dlaczego?**
- Eliminuje ryzyko circular imports
- Lepszy tree shaking
- 68% redukcja załadowanych modułów podczas developmentu

## Zod 4 z OpenAPI Target

Dla kompatybilności z Gemini API, używamy natywnej konwersji JSON Schema z Zod 4 z targetem OpenAPI 3.0:

```typescript
import * as z from 'zod/v4';

const IssueSchema = z.object({
  id: z.string().describe('Unique identifier'),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  message: z.string().describe('Issue description'),
});

// Dla Gemini API - MUSI używać OpenAPI 3.0 target
const jsonSchema = z.toJSONSchema(IssueSchema, {
  target: 'openapi-3.0'
});
```

## Gemini Client

Funkcyjny wrapper wokół Google GenAI SDK:

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
            // Użyj responseJsonSchema (nie responseSchema!)
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

## System pluginów (Vite-Style)

Proste hooki, które łatwo pisać i rozumieć:

```typescript
export interface StargazerPlugin {
  readonly name: string;

  // Opcjonalne hooki
  readonly beforeReview?: (ctx: ReviewContext) => ReviewContext;
  readonly afterReview?: (result: ReviewResult) => ReviewResult;
  readonly filterIssues?: (issues: Issue[]) => Issue[];
}

// Plugin to po prostu funkcja zwracająca obiekt
export type PluginFactory<T> = (options?: T) => StargazerPlugin;

// Przykładowy plugin
export const ignorePathsPlugin: PluginFactory<{ paths: string[] }> = (options) => ({
  name: 'ignore-paths',
  filterIssues: (issues) =>
    issues.filter(i => !options?.paths.some(p => i.file.includes(p))),
});
```

## Konfiguracja TypeScript

Używamy `bundler` mode dla czystych importów:

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

**Korzyści:**
- Czyste importy bez `.js` extensions
- TypeScript tylko type-checkuje, tsup bundluje
- Dual ESM/CJS output dla kompatybilności

## System budowania

Używamy pnpm + Turborepo + tsup:

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

## Źródła

- [TkDodo - Please Stop Using Barrel Files](https://tkdodo.eu/blog/please-stop-using-barrel-files)
- [Vite Plugin API](https://vite.dev/guide/api-plugin)
- [TypeScript Bundler Mode](https://www.typescriptlang.org/tsconfig/moduleResolution.html)
- [Zod 4 JSON Schema](https://zod.dev/json-schema)
- [Gemini API Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)
