---
id: task-043
title: Update review to use conventions
status: done
assignee: voitb
priority: medium
labels:
  - core
  - review
created: '2026-01-01'
order: 430
---
## Description

Update the review function to load and use cached conventions.

## Acceptance Criteria

- [x] Update `packages/core/src/review/review.ts`
- [x] Try to load conventions from cache
- [x] Pass conventions to prompt builder
- [x] Conventions are optional (review works without them)

## Implementation

**File**: `packages/core/src/review/review.ts`

```typescript
import type { Result } from '../shared/result';
import type { GeminiClient } from '../gemini/types';
import type { ReviewResult } from './schemas';
import { ReviewResultSchema } from './schemas';
import { buildReviewPrompt } from './prompts';
import { getDiff } from '../context/git';
import { loadConventions } from '../conventions/cache';
import { err } from '../shared/result';

export type ReviewOptions = {
  readonly staged?: boolean;
  readonly diff?: string;
  readonly projectDir?: string;
  readonly useConventions?: boolean;
};

export async function reviewDiff(
  client: GeminiClient,
  options: ReviewOptions = {}
): Promise<Result<ReviewResult>> {
  const {
    staged = true,
    diff: providedDiff,
    projectDir = process.cwd(),
    useConventions = true,
  } = options;

  // Get diff
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

  // Try to load conventions (optional)
  let conventions = undefined;
  if (useConventions) {
    const conventionsResult = await loadConventions(projectDir);
    if (conventionsResult.ok) {
      conventions = conventionsResult.data;
    }
    // If loading fails, just continue without conventions
  }

  // Build prompt and call Gemini
  const prompt = buildReviewPrompt(diff, conventions);
  return client.generate(prompt, ReviewResultSchema);
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
