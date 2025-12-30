# Pluginy

Stargazer używa systemu pluginów w stylu Vite - proste hooki, które łatwo pisać i rozumieć.

## Struktura pluginu

Plugin to po prostu funkcja zwracająca obiekt z opcjonalnymi hookami:

```typescript
import type { StargazerPlugin, PluginFactory } from '@stargazer/core';

// Definiuj plugin jako factory function
export const myPlugin: PluginFactory<{ option: string }> = (options) => ({
  name: 'my-plugin',

  // Opcjonalne hooki
  beforeReview: (ctx) => ctx,
  afterReview: (result) => result,
  filterIssues: (issues) => issues,
});
```

## Dostępne hooki

### `beforeReview`

Wywoływany przed startem AI review. Użyj do modyfikacji kontekstu review.

```typescript
beforeReview?: (ctx: ReviewContext) => ReviewContext | Promise<ReviewContext>;
```

**Przykład: Dodaj własny kontekst**

```typescript
export const addContextPlugin: PluginFactory = () => ({
  name: 'add-context',
  beforeReview: (ctx) => ({
    ...ctx,
    customData: {
      timestamp: Date.now(),
      environment: 'production',
    },
  }),
});
```

### `afterReview`

Wywoływany po zakończeniu AI review. Użyj do modyfikacji wyniku.

```typescript
afterReview?: (result: ReviewResult, ctx: ReviewContext) => ReviewResult | Promise<ReviewResult>;
```

**Przykład: Dodaj metadane**

```typescript
export const addMetadataPlugin: PluginFactory = () => ({
  name: 'add-metadata',
  afterReview: (result, ctx) => ({
    ...result,
    metadata: {
      reviewedAt: new Date().toISOString(),
      filesReviewed: ctx.changedFiles.length,
    },
  }),
});
```

### `filterIssues`

Wywoływany do filtrowania lub modyfikacji znalezionych issues. Użyj do wykluczania lub transformacji.

```typescript
filterIssues?: (issues: Issue[]) => Issue[];
```

**Przykład: Ignoruj ścieżki**

```typescript
export const ignorePathsPlugin: PluginFactory<{ paths: string[] }> = (options) => ({
  name: 'ignore-paths',
  filterIssues: (issues) =>
    issues.filter(issue =>
      !options?.paths.some(path => issue.file.includes(path))
    ),
});
```

**Przykład: Podnieś severity**

```typescript
export const upgradeSeverityPlugin: PluginFactory<{ category: string }> = (options) => ({
  name: 'upgrade-severity',
  filterIssues: (issues) =>
    issues.map(issue =>
      issue.category === options?.category && issue.severity === 'medium'
        ? { ...issue, severity: 'high' }
        : issue
    ),
});
```

### `beforeDiscovery`

Wywoływany przed rozpoczęciem odkrywania konwencji. Użyj do filtrowania plików.

```typescript
beforeDiscovery?: (files: FileContext[]) => FileContext[];
```

**Przykład: Tylko TypeScript**

```typescript
export const typescriptOnlyPlugin: PluginFactory = () => ({
  name: 'typescript-only',
  beforeDiscovery: (files) =>
    files.filter(f => f.path.endsWith('.ts') || f.path.endsWith('.tsx')),
});
```

### `afterDiscovery`

Wywoływany po zakończeniu odkrywania konwencji. Użyj do modyfikacji odkrytych konwencji.

```typescript
afterDiscovery?: (conventions: ProjectConventions) => ProjectConventions;
```

**Przykład: Dodaj własne konwencje**

```typescript
export const customConventionsPlugin: PluginFactory = () => ({
  name: 'custom-conventions',
  afterDiscovery: (conventions) => ({
    ...conventions,
    patterns: [
      ...conventions.patterns,
      {
        name: 'error-handling',
        description: 'Zawsze używaj Result type do obsługi błędów',
        examples: [],
      },
    ],
  }),
});
```

## Używanie pluginów

Dodaj pluginy do konfiguracji:

```typescript
// stargazer.config.ts
import { defineConfig } from '@stargazer/core';
import { ignorePathsPlugin } from './plugins/ignore-paths';
import { upgradeSeverityPlugin } from './plugins/upgrade-severity';

export default defineConfig({
  model: 'gemini-2.0-flash',
  plugins: [
    ignorePathsPlugin({
      paths: ['/legacy/', '/generated/', '/vendor/'],
    }),
    upgradeSeverityPlugin({
      category: 'security',
    }),
  ],
});
```

## Kolejność wykonywania pluginów

Pluginy wykonywane są w kolejności, w jakiej zostały zdefiniowane:

1. Hooki `beforeReview` wykonywane są po kolei (pierwszy plugin pierwszy)
2. Następuje AI review
3. Hooki `filterIssues` wykonywane są po kolei
4. Hooki `afterReview` wykonywane są po kolei

Każdy hook otrzymuje output poprzedniego hooka, umożliwiając kompozycję:

```typescript
// Output filterIssues Pluginu 1 → Input filterIssues Pluginu 2
export default defineConfig({
  plugins: [
    filterByPathPlugin({ paths: ['/test/'] }),    // Uruchamiany pierwszy
    filterBySeverityPlugin({ min: 'medium' }),     // Otrzymuje przefiltrowany output
    addMetadataPlugin(),                           // Otrzymuje dalej przefiltrowany output
  ],
});
```

## Dobre praktyki

### Utrzymuj pluginy skupione

Każdy plugin powinien robić jedną rzecz dobrze:

```typescript
// DOBRZE - skupione pluginy
const ignoreTestsPlugin = () => ({ /* ... */ });
const upgradeSecurityPlugin = () => ({ /* ... */ });

// ŹLE - plugin robi za dużo
const doEverythingPlugin = () => ({
  beforeReview: /* ... */,
  afterReview: /* ... */,
  filterIssues: /* ... */,
  beforeDiscovery: /* ... */,
  afterDiscovery: /* ... */,
});
```

### Używaj TypeScript

Wykorzystaj TypeScript dla type safety:

```typescript
import type { StargazerPlugin, PluginFactory, Issue } from '@stargazer/core';

interface IgnorePathsOptions {
  paths: string[];
  caseSensitive?: boolean;
}

export const ignorePathsPlugin: PluginFactory<IgnorePathsOptions> = (options) => ({
  name: 'ignore-paths',
  filterIssues: (issues: Issue[]): Issue[] => {
    const paths = options?.paths ?? [];
    const caseSensitive = options?.caseSensitive ?? false;

    return issues.filter(issue => {
      const filePath = caseSensitive ? issue.file : issue.file.toLowerCase();
      return !paths.some(p =>
        filePath.includes(caseSensitive ? p : p.toLowerCase())
      );
    });
  },
});
```

### Obsługuj błędy gracefully

Nie rzucaj wyjątków w hookach - zwróć input bez zmian jeśli coś pójdzie nie tak:

```typescript
export const safePlugin: PluginFactory = () => ({
  name: 'safe-plugin',
  filterIssues: (issues) => {
    try {
      // Twoja logika tutaj
      return processIssues(issues);
    } catch (e) {
      console.error('Błąd pluginu:', e);
      return issues; // Zwróć input bez zmian
    }
  },
});
```

## Publikowanie pluginów

Aby udostępnić plugin:

1. Utwórz pakiet z pluginem
2. Eksportuj factory function
3. Udokumentuj opcje

```typescript
// @stargazer/plugin-security/src/index.ts
export { securityPlugin } from './security-plugin';
export type { SecurityPluginOptions } from './types';
```

```typescript
// Użycie
import { securityPlugin } from '@stargazer/plugin-security';

export default defineConfig({
  plugins: [
    securityPlugin({
      strictMode: true,
    }),
  ],
});
```
