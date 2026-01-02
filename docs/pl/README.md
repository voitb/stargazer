# Dokumentacja Stargazer

> AI-Powered PR Review z Zero-Config Convention Learning

## Przegląd

Stargazer to bot do code review oparty na AI, który automatycznie uczy się konwencji kodowania Twojego projektu i zapewnia spójne, kontekstowe przeglądy PR używając Google Gemini API.

### Kluczowe funkcje

- **Zero-Config Convention Learning** - Automatycznie odkrywa i uczy się wzorców kodowania projektu
- **Kontekstowe Reviews** - Rozumie architekturę codebase dla trafnego feedbacku
- **Vite-Style Plugins** - Prosty system hooków do łatwej customizacji
- **GitHub Action** - Drop-in integracja dla każdego repozytorium

## Szybkie linki

- [Szybki Start](./quick-start.md) - Uruchom w 5 minut
- [Architektura](./architecture.md) - Szczegóły techniczne
- [Pluginy](./plugins.md) - Tworzenie własnych pluginów

## Instalacja

### Jako GitHub Action (Rekomendowane)

```yaml
# .github/workflows/review.yml
name: AI Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: stargazer/action@v1
        with:
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
```

### Jako CLI

```bash
npm install -g @stargazer/cli

# Review aktualnych zmian
stargazer review

# Odkryj konwencje w codebase
stargazer discover
```

### Jako biblioteka

```typescript
import { createStargazer, defineConfig } from '@stargazer/core';

const config = defineConfig({
  model: 'gemini-2.0-flash',
  minSeverity: 'high',
});

const stargazer = await createStargazer(config);
const result = await stargazer.review({ diff, changedFiles });

if (result.ok) {
  console.log(result.data.summary);
}
```

## Konfiguracja

Utwórz `stargazer.config.ts` w root projektu:

```typescript
import { defineConfig } from '@stargazer/core';

export default defineConfig({
  model: 'gemini-2.0-flash',
  minSeverity: 'high',
  maxComments: 10,
  categories: ['bug', 'security', 'convention', 'performance'],
  ignore: ['**/node_modules/**', '**/dist/**'],
  plugins: [],
});
```

## Kluczowe decyzje architektoniczne

- **100% Functional** - Bez klas, używamy factory functions i closures
- **Result Pattern** - Jawne error handling z `Result<T, E>`
- **NO Internal Barrels** - Direct imports dla lepszego tree shaking
- **Zod 4** - Natywny JSON Schema z `target: 'openapi-3.0'`
- **TypeScript Bundler Mode** - Czyste importy bez `.js`

## Licencja

MIT License - Zobacz [LICENSE](../../LICENSE)
