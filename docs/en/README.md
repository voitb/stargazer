# Stargazer Documentation

> AI-Powered PR Review with Zero-Config Convention Learning

## Overview

Stargazer is an AI-powered code review bot that automatically learns your project's coding conventions and provides consistent, context-aware PR reviews using Google's Gemini API.

### Key Features

- **Zero-Config Convention Learning** - Automatically discovers and learns your project's coding patterns
- **Context-Aware Reviews** - Understands your codebase architecture for relevant feedback
- **Vite-Style Plugins** - Simple hook-based plugin system for easy customization
- **GitHub Action** - Drop-in integration for any repository

## Quick Links

- [Quick Start](./quick-start.md) - Get up and running in 5 minutes
- [Architecture](./architecture.md) - Technical deep dive
- [Plugins](./plugins.md) - Create custom plugins
- [API Reference](./api-reference.md) - Full API documentation

## Installation

### As GitHub Action (Recommended)

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

### As CLI Tool

```bash
npm install -g @stargazer/cli

# Review current changes
stargazer review

# Discover conventions in your codebase
stargazer discover
```

### As Library

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

## Configuration

Create `stargazer.config.ts` in your project root:

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

## Architecture Highlights

- **100% Functional** - No classes, uses factory functions and closures
- **Result Pattern** - Explicit error handling with `Result<T, E>`
- **NO Internal Barrels** - Direct imports for better tree shaking
- **Zod 4** - Native JSON Schema with OpenAPI 3.0 target
- **TypeScript Bundler Mode** - Clean imports without `.js` extensions

## License

MIT License - See [LICENSE](../../LICENSE)
