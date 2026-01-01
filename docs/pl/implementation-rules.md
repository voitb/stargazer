# Zasady Implementacji Stargazer

> **Dla Agentów AI**: Przestrzegaj tych zasad DOKŁADNIE podczas pisania kodu dla Stargazer.

## Szybka Referencja

| Zasada | ROBIMY | NIE ROBIMY |
|--------|--------|------------|
| Obsługa błędów | `Result<T, E>` | `throw` / `try-catch` |
| Klasy | `createX()` factory | `class X {}` |
| Importy | `'../shared/result'` | `'../shared'` (barrel) |
| Zod | `import * as z from 'zod/v4'` | `import { z } from 'zod'` |
| Gemini | `responseJsonSchema` | `responseSchema` |
| Typy | właściwości `readonly` | mutowalne interfejsy |

---

## 1. Obsługa Błędów (Result Pattern)

### MUSISZ

- ✅ ZAWSZE zwracaj `Result<T, E>` z funkcji, które mogą zawieść
- ✅ ZAWSZE używaj helperów `ok()` i `err()`
- ✅ ZAWSZE sprawdzaj `result.ok` przed dostępem do `result.data`

### NIGDY

- ❌ NIGDY nie rzucaj wyjątków w kodzie biblioteki
- ❌ NIGDY nie używaj try-catch do sterowania przepływem (tylko do przechwytywania błędów SDK)
- ❌ NIGDY nie zwracaj `null` lub `undefined` dla błędów

### Przykład Kodu

```typescript
import { ok, err } from '../shared/result';
import type { Result, ApiError } from '../shared/result';

// ❌ ŹLLE - rzuca wyjątek
async function getData(): Promise<Data> {
  throw new Error('Failed to fetch');
}

// ✅ DOBRZE - zwraca Result
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

// ✅ DOBRZE - konsumowanie Result
const result = await getData();
if (!result.ok) {
  console.error(result.error.message);
  return;
}
// TypeScript wie, że result.data to Data
console.log(result.data);
```

---

## 2. Bez Klas (Factory Functions)

### MUSISZ

- ✅ ZAWSZE używaj factory functions: `createX()`
- ✅ ZAWSZE zwracaj obiekty interfejsu (nie instancje klas)
- ✅ ZAWSZE używaj closures dla prywatnego stanu

### NIGDY

- ❌ NIGDY nie używaj słowa kluczowego `class`
- ❌ NIGDY nie używaj `this`
- ❌ NIGDY nie używaj `new` dla własnych typów

### Przykład Kodu

```typescript
// ❌ ŹLLE - oparte na klasie
class GeminiClient {
  private client: GoogleGenAI;

  constructor(private apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(prompt: string): Promise<string> {
    return this.client.models.generateContent({ ... });
  }
}

// ✅ DOBRZE - factory function
export interface GeminiClient {
  readonly generate: <T extends z.ZodType>(
    prompt: string,
    schema: T
  ) => Promise<Result<z.infer<T>>>;
}

export function createGeminiClient(apiKey: string): GeminiClient {
  // Prywatny stan przez closure (bez `this`)
  const client = new GoogleGenAI({ apiKey });

  return {
    generate: async (prompt, schema) => {
      // Użyj `client` z closure
      const response = await client.models.generateContent({ ... });
      return ok(response);
    },
  };
}
```

---

## 3. Bez Barrel Files (Bezpośrednie Importy)

### MUSISZ

- ✅ ZAWSZE importuj bezpośrednio: `'../shared/result'`
- ✅ TYLKO JEDEN barrel w `src/index.ts` (publiczne API)
- ✅ ZAWSZE używaj jawnych ścieżek do plików

### NIGDY

- ❌ NIGDY nie twórz `index.ts` wewnątrz folderów funkcjonalności
- ❌ NIGDY nie importuj ze ścieżek folderów: `'../shared'`
- ❌ NIGDY nie re-eksportuj wszystkiego z jednego pliku

### Przykład Kodu

```typescript
// ❌ ŹLLE - barrel imports
import { ok, err, createGeminiClient, GeminiClient } from '../shared';
import { IssueSchema, ReviewResultSchema } from '../review';

// ✅ DOBRZE - bezpośrednie importy
import { ok, err } from '../shared/result';
import type { Result } from '../shared/result';
import { createGeminiClient } from '../gemini/client';
import type { GeminiClient } from '../gemini/types';
import { IssueSchema } from '../review/schemas';
import type { Issue } from '../review/types';
```

### Struktura Plików

```
src/
├── index.ts              # ✅ JEDYNY publiczny barrel
├── shared/               # ❌ BEZ index.ts tutaj!
│   ├── result.ts
│   └── types.ts
├── gemini/               # ❌ BEZ index.ts tutaj!
│   ├── client.ts
│   └── types.ts
└── review/               # ❌ BEZ index.ts tutaj!
    ├── engine.ts
    ├── schemas.ts
    └── types.ts
```

---

## 4. Schematy Zod

### MUSISZ

- ✅ ZAWSZE importuj jako `import * as z from 'zod/v4'`
- ✅ ZAWSZE używaj `.describe()` dla WSZYSTKICH pól schematu
- ✅ ZAWSZE używaj `z.int()` dla liczb całkowitych
- ✅ ZAWSZE używaj `z.toJSONSchema(schema, { target: 'openapi-3.0' })` dla Gemini

### NIGDY

- ❌ NIGDY nie używaj `import { z } from 'zod'` (niepoprawne dla v4)
- ❌ NIGDY nie pomijaj `.describe()` na polach
- ❌ NIGDY nie używaj `z.number().int()` (użyj `z.int()` zamiast tego)

### Przykład Kodu

```typescript
import * as z from 'zod/v4';

// ✅ DOBRZE - pełny schemat z opisami
export const IssueSchema = z.object({
  id: z.string().describe('Unikalny identyfikator tego problemu'),
  file: z.string().describe('Względna ścieżka do pliku'),
  line: z.int().positive().describe('Numer linii w pliku'),
  severity: z.enum(['critical', 'high', 'medium', 'low']).describe('Poziom ważności problemu'),
  category: z.enum(['bug', 'security', 'convention', 'performance']).describe('Kategoria problemu'),
  message: z.string().describe('Jasny opis problemu'),
  suggestion: z.string().optional().describe('Sugerowana poprawka kodu'),
  confidence: z.number().min(0).max(1).describe('Wynik pewności 0-1'),
}).describe('Pojedynczy problem w code review');

// Wywnioskuj typ ze schematu
export type Issue = z.infer<typeof IssueSchema>;

// Konwertuj dla Gemini API - ZAWSZE używaj target OpenAPI 3.0
export const IssueJSONSchema = z.toJSONSchema(IssueSchema, {
  target: 'openapi-3.0'
});
```

---

## 5. Gemini API

### MUSISZ

- ✅ ZAWSZE używaj `responseJsonSchema` (nie `responseSchema`)
- ✅ ZAWSZE ustawiaj `responseMimeType: 'application/json'`
- ✅ ZAWSZE waliduj odpowiedź z Zod `.safeParse()` po JSON.parse
- ✅ ZAWSZE obsługuj rate limiting (429) jawnie

### NIGDY

- ❌ NIGDY nie używaj `responseSchema` (użyj `responseJsonSchema`)
- ❌ NIGDY nie ufaj surowej odpowiedzi bez walidacji
- ❌ NIGDY nie ignoruj pustych odpowiedzi

### Przykład Kodu

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
        // ✅ POPRAWNA konfiguracja
        responseMimeType: 'application/json',
        responseJsonSchema: z.toJSONSchema(schema, { target: 'openapi-3.0' }),
        temperature: 0.2,
      },
    });

    // ✅ ZAWSZE sprawdzaj pustą odpowiedź
    const text = response.text;
    if (!text) {
      return err({ code: 'EMPTY_RESPONSE', message: 'Gemini zwrócił pustą odpowiedź' });
    }

    // ✅ ZAWSZE waliduj z Zod
    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success) {
      return err({ code: 'SCHEMA_VALIDATION', message: parsed.error.message });
    }

    return ok(parsed.data);
  } catch (e) {
    // ✅ ZAWSZE obsługuj rate limiting jawnie
    if (e instanceof ApiError && e.status === 429) {
      return err({ code: 'RATE_LIMITED', message: e.message, cause: e });
    }
    return err({ code: 'API_ERROR', message: String(e), cause: e });
  }
}
```

---

## 6. Bezpieczeństwo Typów

### MUSISZ

- ✅ ZAWSZE używaj `readonly` dla właściwości interfejsu
- ✅ ZAWSZE używaj `as const` dla literałów tablic/obiektów
- ✅ ZAWSZE zawężaj typy przed ich użyciem
- ✅ ZAWSZE używaj `unknown` jeśli typ jest naprawdę nieznany

### NIGDY

- ❌ NIGDY nie używaj `any`
- ❌ NIGDY nie używaj asercji typów (`as X`) bez walidacji
- ❌ NIGDY nie ignoruj błędów TypeScript z `@ts-ignore`

### Przykład Kodu

```typescript
// ✅ DOBRZE - właściwości readonly
export interface StargazerConfig {
  readonly apiKey: string;
  readonly model: Model;
  readonly minSeverity: Severity;
}

// ✅ DOBRZE - asercje const
const MODELS = ['gemini-2.0-flash', 'gemini-2.0-pro'] as const;
type Model = typeof MODELS[number];

const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
type Severity = typeof SEVERITIES[number];

// ✅ DOBRZE - zawężanie typów
function processResult(result: Result<Data>): void {
  if (!result.ok) {
    // TypeScript wie, że result.error istnieje
    console.error(result.error.message);
    return;
  }
  // TypeScript wie, że result.data istnieje
  console.log(result.data);
}

// ❌ ŹLLE - używanie any
function process(data: any) { ... }

// ✅ DOBRZE - używanie unknown z walidacją
function process(data: unknown): Result<Data> {
  const parsed = DataSchema.safeParse(data);
  if (!parsed.success) {
    return err({ code: 'SCHEMA_VALIDATION', message: parsed.error.message });
  }
  return ok(parsed.data);
}
```

---

## 7. Konwencje Nazewnictwa

| Typ | Konwencja | Przykład |
|-----|-----------|----------|
| Funkcje | camelCase | `createGeminiClient`, `filterIssues` |
| Typy/Interfejsy | PascalCase | `GeminiClient`, `ReviewResult` |
| Stałe | SCREAMING_SNAKE_CASE | `DEFAULT_MODEL`, `MAX_RETRIES` |
| Pliki | kebab-case.ts | `gemini-client.ts`, `review-engine.ts` |
| Foldery | kebab-case | `shared/`, `review/` |

### Przykład Kodu

```typescript
// ✅ POPRAWNE nazewnictwo
// Plik: src/gemini/client.ts

import type { GeminiClient, GenerateOptions } from './types';

const DEFAULT_MODEL = 'gemini-2.0-flash';
const MAX_RETRIES = 3;

export function createGeminiClient(apiKey: string): GeminiClient {
  // ...
}
```

---

## 8. Async/Await

### MUSISZ

- ✅ ZAWSZE używaj async/await (nigdy surowych Promise z `.then()`)
- ✅ ZAWSZE zwracaj `Promise<Result<T>>` dla operacji asynchronicznych
- ✅ ZAWSZE obsługuj błędy wewnątrz funkcji async

### NIGDY

- ❌ NIGDY nie używaj łańcuchów `.then().catch()`
- ❌ NIGDY nie zostawiaj nieobsłużonych promise'ów
- ❌ NIGDY nie używaj callbacków dla operacji asynchronicznych

### Przykład Kodu

```typescript
// ❌ ŹLLE - łańcuchy Promise
function fetchData(): Promise<Data> {
  return fetch(url)
    .then(res => res.json())
    .then(data => processData(data))
    .catch(err => { throw err; });
}

// ✅ DOBRZE - async/await z Result
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

## 9. Eksporty

### MUSISZ

- ✅ ZAWSZE używaj named exports
- ✅ ZAWSZE eksportuj typy osobno z `export type`
- ✅ ZAWSZE umieszczaj eksporty typów razem z ich implementacjami

### NIGDY

- ❌ NIGDY nie używaj default exports
- ❌ NIGDY nie używaj `export default`
- ❌ NIGDY nie używaj `require()`

### Przykład Kodu

```typescript
// ❌ ŹLLE - default export
export default function createClient() { ... }

// ✅ DOBRZE - named exports
export function createGeminiClient(apiKey: string): GeminiClient { ... }

export type { GeminiClient, GenerateOptions } from './types';
```

---

## 10. Kody Błędów

Używaj tych ustandaryzowanych kodów błędów:

```typescript
export type ErrorCode =
  | 'API_ERROR'           // Wywołanie Gemini API nie powiodło się
  | 'SCHEMA_VALIDATION'   // Walidacja Zod nie powiodła się
  | 'CONFIG_INVALID'      // Nieprawidłowa konfiguracja
  | 'GIT_ERROR'           // Operacja Git nie powiodła się
  | 'RATE_LIMITED'        // Osiągnięto limit API (429)
  | 'UNAUTHORIZED'        // Nieprawidłowy klucz API (401)
  | 'BAD_REQUEST'         // Nieprawidłowe żądanie (400)
  | 'EMPTY_RESPONSE'      // API zwróciło pustą odpowiedź
  | 'TIMEOUT'             // Przekroczono limit czasu żądania
  | 'FILE_NOT_FOUND';     // Plik nie istnieje
```

---

## Checklista NIGDY NIE RÓB

1. ❌ NIGDY nie używaj `console.log` w kodzie biblioteki (tylko w CLI)
2. ❌ NIGDY nie mutuj argumentów funkcji
3. ❌ NIGDY nie używaj default exports
4. ❌ NIGDY nie używaj `require()` (używaj ES imports)
5. ❌ NIGDY nie używaj konkatenacji stringów dla promptów (używaj template literals)
6. ❌ NIGDY nie hardkoduj kluczy API (używaj zmiennych środowiskowych)
7. ❌ NIGDY nie używaj `@ts-ignore` ani `@ts-expect-error`
8. ❌ NIGDY nie używaj typu `any`
9. ❌ NIGDY nie rzucaj wyjątków w kodzie biblioteki
10. ❌ NIGDY nie twórz plików index.ts barrel w folderach funkcjonalności

---

## Szybka Checklista Przed Commitem

- [ ] Wszystkie funkcje, które mogą zawieść, zwracają `Result<T, E>`
- [ ] Brak klas, tylko factory functions
- [ ] Brak barrel imports (tylko bezpośrednie ścieżki do plików)
- [ ] Wszystkie pola schematów Zod mają `.describe()`
- [ ] Gemini używa `responseJsonSchema` z target OpenAPI 3.0
- [ ] Wszystkie właściwości interfejsów są `readonly`
- [ ] Brak typów `any`
- [ ] Tylko named exports (brak default exports)
- [ ] Spójne konwencje nazewnictwa
- [ ] Wszystkie funkcje async używają async/await
