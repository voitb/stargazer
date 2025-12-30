# Szybki Start

Uruchom Stargazer w swoim projekcie w 5 minut.

## Wymagania

- Node.js 18+
- Klucz API Google Gemini ([Pobierz tutaj](https://makersuite.google.com/app/apikey))
- Repozytorium GitHub (dla GitHub Action)

## Opcja 1: GitHub Action (Rekomendowane)

### Krok 1: Dodaj klucz API do Secrets

1. Przejdź do Settings > Secrets and variables > Actions w repozytorium
2. Dodaj nowy secret `GEMINI_API_KEY` z Twoim kluczem Gemini API

### Krok 2: Utwórz Workflow

Utwórz `.github/workflows/review.yml`:

```yaml
name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: stargazer/action@v1
        with:
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
```

### Krok 3: Otwórz PR

Otwórz pull request, a Stargazer automatycznie go przejrzy!

## Opcja 2: CLI

### Krok 1: Instalacja

```bash
npm install -g @stargazer/cli
```

### Krok 2: Ustaw klucz API

```bash
export GEMINI_API_KEY=twoj-klucz-api
```

### Krok 3: Review zmian

```bash
# Review staged changes
stargazer review

# Review konkretnych plików
stargazer review src/components/*.tsx

# Output jako JSON
stargazer review --format json
```

## Opcja 3: Programatyczne użycie

### Krok 1: Instalacja

```bash
npm install @stargazer/core
```

### Krok 2: Użycie w kodzie

```typescript
import { createStargazer, defineConfig } from '@stargazer/core';

async function reviewCode() {
  const stargazer = await createStargazer({
    config: defineConfig({
      model: 'gemini-2.0-flash',
    }),
  });

  if (!stargazer.ok) {
    console.error('Błąd tworzenia Stargazer:', stargazer.error);
    return;
  }

  const result = await stargazer.data.review({
    diff: '...twój diff tutaj...',
    changedFiles: ['src/index.ts'],
  });

  if (result.ok) {
    console.log('Podsumowanie:', result.data.summary);
    console.log('Znalezione problemy:', result.data.issues.length);
  }
}
```

## Konfiguracja

Utwórz `stargazer.config.ts` dla customizacji:

```typescript
import { defineConfig } from '@stargazer/core';

export default defineConfig({
  // Model Gemini do użycia
  model: 'gemini-2.0-flash',

  // Minimalna severity do raportowania
  minSeverity: 'high', // 'critical' | 'high' | 'medium' | 'low'

  // Maksymalna liczba komentarzy per review
  maxComments: 10,

  // Kategorie do sprawdzania
  categories: ['bug', 'security', 'convention', 'performance'],

  // Pliki/wzorce do ignorowania
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.min.js',
  ],

  // Własne pluginy
  plugins: [],
});
```

## Odkrywanie konwencji

Stargazer może automatycznie nauczyć się konwencji Twojego projektu:

```bash
# Odkryj i zapisz konwencje
stargazer discover

# Tworzy .stargazer/conventions.json
```

Odkryte konwencje są następnie używane do bardziej trafnych review specyficznych dla wzorców Twojego codebase.

## Następne kroki

- [Architektura](./architecture.md) - Zrozum jak działa Stargazer
- [Pluginy](./plugins.md) - Twórz własne pluginy
- [API Reference](./api-reference.md) - Pełna dokumentacja API
