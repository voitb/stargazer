---
id: task-025
title: Create reviewDiff function
status: todo
priority: high
labels:
  - core
  - review
created: '2026-01-01'
order: 250
---
## Description

Create the main review function that orchestrates getting the diff and calling Gemini.

## Acceptance Criteria

- [ ] Create `packages/core/src/review/review.ts`
- [ ] Implement `reviewDiff()` function
- [ ] Integrates getDiff and buildReviewPrompt
- [ ] Calls GeminiClient with ReviewResultSchema
- [ ] Returns Result<ReviewResult>

## Implementation

**File**: `packages/core/src/review/review.ts`

```typescript
import type { Result } from '../shared/result';
import type { GeminiClient } from '../gemini/types';
import type { ReviewResult } from './schemas';
import { ReviewResultSchema } from './schemas';
import { buildReviewPrompt } from './prompts';
import { getDiff } from '../context/git';
import { err } from '../shared/result';

export type ReviewOptions = {
  readonly staged?: boolean;
  readonly diff?: string; // Allow passing diff directly (for GitHub Action)
};

export async function reviewDiff(
  client: GeminiClient,
  options: ReviewOptions = {}
): Promise<Result<ReviewResult>> {
  const { staged = true, diff: providedDiff } = options;

  // Use provided diff or get from git
  let diff: string;
  if (providedDiff) {
    diff = providedDiff;
  } else {
    const diffResult = await getDiff(staged);
    if (!diffResult.ok) return diffResult;
    diff = diffResult.data;
  }

  // Check for empty diff
  if (!diff.trim()) {
    return err({
      code: 'EMPTY_RESPONSE',
      message: 'No changes to review',
    });
  }

  // Build prompt and call Gemini
  const prompt = buildReviewPrompt(diff);
  return client.generate(prompt, ReviewResultSchema);
}
```

## Test

TypeScript compiles without errors.

```bash
cd packages/core && pnpm tsc --noEmit
```
