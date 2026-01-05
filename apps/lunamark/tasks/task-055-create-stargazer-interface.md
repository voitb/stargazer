---
id: task-055
title: Create Stargazer interface
status: todo
assignee: voitb
priority: high
labels:
  - core
created: '2026-01-01'
order: 550
---
## Description

Create the main Stargazer facade interface.

## Acceptance Criteria

- [ ] Create `packages/core/src/stargazer.ts`
- [ ] Define Stargazer interface
- [ ] Define StargazerOptions type
- [ ] Include review and discover methods

## Implementation

**File**: `packages/core/src/stargazer.ts`

```typescript
import type { Result } from './shared/result';
import type { ReviewResult } from './review/schemas';
import type { ProjectConventions } from './conventions/schemas';
import type { ResolvedConfig, StargazerConfig } from './config/types';

/**
 * Options for reviewing code.
 */
export type ReviewOptions = {
  /** Review staged changes (default: true) */
  readonly staged?: boolean;
  /** Provide diff directly instead of using git */
  readonly diff?: string;
};

/**
 * Options for creating a Stargazer instance.
 */
export type StargazerOptions = {
  /** Gemini API key */
  readonly apiKey: string;
  /** Optional configuration */
  readonly config?: StargazerConfig;
  /** Project directory (default: cwd) */
  readonly projectDir?: string;
};

/**
 * Main Stargazer facade - the primary way to interact with the library.
 */
export type Stargazer = {
  /** Resolved configuration */
  readonly config: ResolvedConfig;

  /** Project directory */
  readonly projectDir: string;

  /**
   * Review code changes.
   * Gets diff from git or uses provided diff.
   */
  readonly review: (options?: ReviewOptions) => Promise<Result<ReviewResult>>;

  /**
   * Discover project conventions.
   * Analyzes code files and saves to .stargazer/conventions.json.
   */
  readonly discover: () => Promise<Result<ProjectConventions>>;
};
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
