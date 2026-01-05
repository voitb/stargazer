---
id: task-028
title: Add review command (basic)
status: done
assignee: voitb
priority: high
labels:
  - cli
  - commands
created: '2026-01-01'
order: 280
---
## Description

Create the review command that calls the core review function.

## Acceptance Criteria

- [x] Create `packages/cli/src/commands/review.ts`
- [x] Implement `reviewCommand` with Commander
- [x] Check for GEMINI_API_KEY environment variable
- [x] Output JSON result initially (formatting comes later)

## Implementation

**File**: `packages/cli/src/commands/review.ts`

```typescript
import { Command } from 'commander';
import { createGeminiClient } from '@stargazer/core/gemini/client';
import { reviewDiff } from '@stargazer/core/review/review';

export const reviewCommand = new Command('review')
  .description('Review staged changes using AI')
  .option('--unstaged', 'Review unstaged changes instead of staged')
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

      // Output JSON for now (terminal formatting in task-030)
      console.log(JSON.stringify(result.data, null, 2));

      // Exit with 1 if issues found, 0 if clean
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

Should output JSON with review result.
