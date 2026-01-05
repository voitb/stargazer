---
id: task-056
title: Create createStargazer factory
status: todo
assignee: voitb
priority: high
labels:
  - core
created: '2026-01-01'
order: 560
---
## Description

Implement the createStargazer factory function.

## Acceptance Criteria

- [ ] Extend `packages/core/src/stargazer.ts`
- [ ] Implement `createStargazer()` factory
- [ ] Wire up all internal components
- [ ] Return Result for validation

## Implementation

**File**: `packages/core/src/stargazer.ts` (extend with implementation)

```typescript
import type { Result } from './shared/result';
import type { ReviewResult } from './review/schemas';
import type { ProjectConventions } from './conventions/schemas';
import type { ResolvedConfig, StargazerConfig } from './config/types';
import { ok, err } from './shared/result';
import { createGeminiClient } from './gemini/client';
import { resolveConfig } from './config/resolve';
import { reviewDiff } from './review/review';
import { discoverConventions } from './conventions/discovery';
import { saveConventions } from './conventions/cache';

// Types (from task-055)
export type ReviewOptions = {
  readonly staged?: boolean;
  readonly diff?: string;
};

export type StargazerOptions = {
  readonly apiKey: string;
  readonly config?: StargazerConfig;
  readonly projectDir?: string;
};

export type Stargazer = {
  readonly config: ResolvedConfig;
  readonly projectDir: string;
  readonly review: (options?: ReviewOptions) => Promise<Result<ReviewResult>>;
  readonly discover: () => Promise<Result<ProjectConventions>>;
};

/**
 * Creates a Stargazer instance.
 *
 * @example
 * const result = createStargazer({
 *   apiKey: process.env.GEMINI_API_KEY!,
 *   config: { minSeverity: 'medium' },
 * });
 *
 * if (result.ok) {
 *   const reviewResult = await result.data.review();
 * }
 */
export function createStargazer(
  options: StargazerOptions
): Result<Stargazer> {
  const { apiKey, projectDir = process.cwd() } = options;

  // Validate API key
  if (!apiKey) {
    return err({
      code: 'UNAUTHORIZED',
      message: 'API key is required. Set GEMINI_API_KEY environment variable.',
    });
  }

  // Resolve configuration
  const config = resolveConfig(options.config);

  // Create Gemini client
  const client = createGeminiClient(apiKey, config.model);

  // Build the facade
  const stargazer: Stargazer = {
    config,
    projectDir,

    review: async (reviewOptions = {}) => {
      return reviewDiff(client, {
        staged: reviewOptions.staged ?? true,
        diff: reviewOptions.diff,
        projectDir,
        useConventions: true,
      });
    },

    discover: async () => {
      const result = await discoverConventions(client, projectDir);

      // Auto-save on success
      if (result.ok) {
        await saveConventions(result.data, projectDir);
      }

      return result;
    },
  };

  return ok(stargazer);
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
