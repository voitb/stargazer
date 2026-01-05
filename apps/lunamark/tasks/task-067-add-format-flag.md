---
id: task-067
title: Add --format flag
status: todo
assignee: voitb
priority: low
labels:
  - cli
  - commands
created: '2026-01-01'
order: 670
---
## Description

Add a --format flag to support different output formats.

## Acceptance Criteria

- [ ] Update `packages/cli/src/commands/review.ts`
- [ ] Add --format option (terminal, json, markdown)
- [ ] Route output through appropriate formatter

## Implementation

**File**: `packages/cli/src/commands/review.ts`

```typescript
import { Command } from 'commander';
import { createGeminiClient } from '@stargazer/core/gemini/client';
import { reviewDiff } from '@stargazer/core/review/review';
import { formatReview as formatTerminal } from '../output/terminal';
import { formatReview as formatMarkdown } from '../output/markdown';
import type { ReviewResult } from '@stargazer/core/review/schemas';

type OutputFormat = 'terminal' | 'json' | 'markdown';

const formatters: Record<OutputFormat, (review: ReviewResult) => string> = {
  terminal: formatTerminal,
  json: (review) => JSON.stringify(review, null, 2),
  markdown: formatMarkdown,
};

export const reviewCommand = new Command('review')
  .description('Review staged changes using AI')
  .option('--unstaged', 'Review unstaged changes instead of staged')
  .option(
    '-f, --format <format>',
    'Output format: terminal, json, markdown',
    'terminal'
  )
  .action(async (options) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY environment variable is required');
      console.error('Set it with: export GEMINI_API_KEY=your-key');
      process.exit(2);
    }

    // Validate format option
    const format = options.format as OutputFormat;
    if (!formatters[format]) {
      console.error(`Error: Invalid format "${format}". Use: terminal, json, markdown`);
      process.exit(2);
    }

    try {
      const client = createGeminiClient(apiKey);
      const result = await reviewDiff(client, {
        staged: !options.unstaged,
      });

      if (!result.ok) {
        console.error(`Error: ${result.error.message}`);
        process.exit(2);
      }

      // Output in requested format
      const formatter = formatters[format];
      console.log(formatter(result.data));

      // Exit codes: 0 = clean, 1 = issues found, 2 = error
      process.exit(result.data.issues.length > 0 ? 1 : 0);
    } catch (error) {
      console.error('Unexpected error:', error);
      process.exit(2);
    }
  });
```

## Test

```bash
cd packages/cli && pnpm build

# Test different formats
GEMINI_API_KEY=xxx pnpm stargazer review --format terminal
GEMINI_API_KEY=xxx pnpm stargazer review --format json
GEMINI_API_KEY=xxx pnpm stargazer review --format markdown
```
