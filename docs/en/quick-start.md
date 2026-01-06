# Quick Start

Get Stargazer running in your project in 5 minutes.

## Prerequisites

- Node.js 18+
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- A GitHub repository (for Action usage)

## Option 1: GitHub Action (Recommended)

### Step 1: Add API Key to Secrets

1. Go to your repository Settings > Secrets and variables > Actions
2. Add a new secret named `GEMINI_API_KEY` with your Gemini API key

### Step 2: Create Workflow

Create `.github/workflows/review.yml`:

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

### Step 3: Open a PR

Open a pull request and Stargazer will automatically review it!

## Option 2: CLI Tool

### Step 1: Install

```bash
npm install -g @stargazer/cli
```

### Step 2: Set API Key

```bash
export GEMINI_API_KEY=your-api-key-here
```

### Step 3: Review Changes

```bash
# Review staged changes
stargazer review

# Review specific files
stargazer review src/components/*.tsx

# Output as JSON
stargazer review --format json
```

## Option 3: Programmatic Usage

### Step 1: Install

```bash
npm install @stargazer/core
```

### Step 2: Use in Code

```typescript
import { createStargazer, defineConfig } from '@stargazer/core';

async function reviewCode() {
  const stargazer = await createStargazer({
    config: defineConfig({
      model: 'gemini-2.0-flash',
    }),
  });

  if (!stargazer.ok) {
    console.error('Failed to create Stargazer:', stargazer.error);
    return;
  }

  const result = await stargazer.data.review({
    diff: '...your diff here...',
    changedFiles: ['src/index.ts'],
  });

  if (result.ok) {
    console.log('Review Summary:', result.data.summary);
    console.log('Issues Found:', result.data.issues.length);
  }
}
```

## Configuration

Create `stargazer.config.ts` for customization:

```typescript
import { defineConfig } from '@stargazer/core';

export default defineConfig({
  // Gemini model to use
  model: 'gemini-2.0-flash',

  // Minimum issue severity to report
  minSeverity: 'high', // 'critical' | 'high' | 'medium' | 'low'

  // Maximum comments per review
  maxComments: 10,

  // Issue categories to check
  categories: ['bug', 'security', 'convention', 'performance'],

  // Files/patterns to ignore
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.min.js',
  ],

  // Custom plugins
  plugins: [],
});
```

## Convention Discovery

Stargazer can automatically learn your project's coding conventions:

```bash
# Discover and save conventions
stargazer discover

# This creates .stargazer/conventions.json
```

The discovered conventions are then used to provide more relevant reviews specific to your codebase patterns.

## Next Steps

- [Architecture](./architecture.md) - Understand how Stargazer works
- [Plugins](./plugins.md) - Create custom review plugins
