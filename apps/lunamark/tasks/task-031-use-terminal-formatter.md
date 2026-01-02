---
id: task-031
title: Use terminal formatter in CLI
status: todo
priority: low
labels:
  - cli
created: '2026-01-01'
order: 310
---
## Description

Update the review command to use the terminal formatter for output.

## Acceptance Criteria

- [ ] Update `packages/cli/src/commands/review.ts`
- [ ] Import formatReview function
- [ ] Use formatted output instead of JSON

## Implementation

**File**: `packages/cli/src/commands/review.ts`

```typescript
import { Command } from 'commander';
import { createGeminiClient } from '@stargazer/core/gemini/client';
import { reviewDiff } from '@stargazer/core/review/review';
import { formatReview } from '../output/terminal';

export const reviewCommand = new Command('review')
  .description('Review staged changes using AI')
  .option('--unstaged', 'Review unstaged changes instead of staged')
  .option('--json', 'Output raw JSON instead of formatted text')
  .action(async (options) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY environment variable is required');
      console.error('Set it with: export GEMINI_API_KEY=your-key');
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

      // Output format based on --json flag
      if (options.json) {
        console.log(JSON.stringify(result.data, null, 2));
      } else {
        console.log(formatReview(result.data));
      }

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
GEMINI_API_KEY=xxx pnpm stargazer review
```

Should show colorful formatted output.

```bash
GEMINI_API_KEY=xxx pnpm stargazer review --json
```

Should show raw JSON.
