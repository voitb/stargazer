---
id: task-115
title: Create useReview hook
status: completed
priority: high
labels:
  - cli
  - tui
  - hooks
  - review
created: '2025-01-06'
order: 115
assignee: glm
---

## Description

Create the useReview hook that integrates with the @stargazer/core review system to analyze git changes.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/hooks/use-review.ts`
- [ ] Implement `getDiff()` helper using git commands
- [ ] Implement `reviewStaged()` function
- [ ] Implement `reviewUnstaged()` function
- [ ] Return `isReviewing` loading state
- [ ] Return `error` state for error handling
- [ ] Integrate with Gemini client and review engine

## Implementation

**File**: `packages/cli/src/tui/hooks/use-review.ts`

```typescript
import { useState, useCallback } from 'react';
import { reviewDiff, createGeminiClient, resolveConfig } from '@stargazer/core';
import type { ReviewResult } from '@stargazer/core';
import { execSync } from 'node:child_process';

interface UseReviewReturn {
  isReviewing: boolean;
  error: string | null;
  reviewStaged: () => Promise<ReviewResult | null>;
  reviewUnstaged: () => Promise<ReviewResult | null>;
}

export function useReview(): UseReviewReturn {
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDiff = useCallback((staged: boolean): string | null => {
    try {
      const command = staged ? 'git diff --staged' : 'git diff';
      const diff = execSync(command, {
        encoding: 'utf-8',
        maxBuffer: 5 * 1024 * 1024, // 5MB limit
      });
      return diff || null;
    } catch {
      return null;
    }
  }, []);

  const runReview = useCallback(async (staged: boolean): Promise<ReviewResult | null> => {
    setIsReviewing(true);
    setError(null);

    try {
      const diff = getDiff(staged);
      if (!diff) {
        setError(staged ? 'No staged changes found' : 'No unstaged changes found');
        return null;
      }

      const config = resolveConfig({});
      const clientResult = createGeminiClient({
        apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
        model: config.model,
      });

      if (!clientResult.ok) {
        setError(clientResult.error.message);
        return null;
      }

      const result = await reviewDiff(clientResult.data, diff, {
        conventions: undefined,
        maxIssues: config.maxIssues,
      });

      if (!result.ok) {
        setError(result.error.message);
        return null;
      }

      return result.data;
    } catch (err) {
      setError(`Review failed: ${err}`);
      return null;
    } finally {
      setIsReviewing(false);
    }
  }, [getDiff]);

  const reviewStaged = useCallback(() => runReview(true), [runReview]);
  const reviewUnstaged = useCallback(() => runReview(false), [runReview]);

  return {
    isReviewing,
    error,
    reviewStaged,
    reviewUnstaged,
  };
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
