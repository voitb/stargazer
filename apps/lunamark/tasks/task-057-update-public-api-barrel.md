---
id: task-057
title: Update public API barrel
status: todo
priority: medium
labels:
  - core
created: '2026-01-01'
order: 570
---
## Description

Update the main package barrel to export all public APIs.

## Acceptance Criteria

- [ ] Update `packages/core/src/index.ts`
- [ ] Export all public types and functions
- [ ] Organize exports by category
- [ ] This is the ONLY barrel file in core

## Implementation

**File**: `packages/core/src/index.ts`

```typescript
// =============================================================================
// Result Pattern
// =============================================================================
export { ok, err, isOk, isErr } from './shared/result';
export type { Result } from './shared/result';
export type { ErrorCode, ApiError } from './shared/error-codes';

// =============================================================================
// Gemini Client
// =============================================================================
export { createGeminiClient } from './gemini/client';
export type { GeminiClient, GenerateOptions } from './gemini/types';
export { MODELS, DEFAULT_MODEL } from './gemini/models';
export type { Model } from './gemini/models';

// =============================================================================
// Review
// =============================================================================
export {
  ReviewResultSchema,
  IssueSchema,
  SeveritySchema,
  CategorySchema,
  DecisionSchema,
} from './review/schemas';
export type {
  ReviewResult,
  Issue,
  Severity,
  Category,
  Decision,
} from './review/schemas';
export { reviewDiff } from './review/review';
export type { ReviewOptions as ReviewDiffOptions } from './review/review';
export { buildReviewPrompt } from './review/prompts';

// =============================================================================
// Conventions
// =============================================================================
export { discoverConventions } from './conventions/discovery';
export type { DiscoveryOptions } from './conventions/discovery';
export { loadConventions, saveConventions } from './conventions/cache';
export {
  ProjectConventionsSchema,
  ConventionPatternSchema,
} from './conventions/schemas';
export type {
  ProjectConventions,
  ConventionPattern,
} from './conventions/schemas';

// =============================================================================
// Context (Git)
// =============================================================================
export { getDiff } from './context/git';

// =============================================================================
// Plugins
// =============================================================================
export type {
  StargazerPlugin,
  PluginFactory,
  ReviewContext,
} from './plugins/types';
export { runHooks, runFilterHooks } from './plugins/hooks';
export { ignorePathsPlugin } from './plugins/ignore-paths';
export type { IgnorePathsOptions } from './plugins/ignore-paths';

// =============================================================================
// Configuration
// =============================================================================
export { defineConfig } from './config/define';
export { resolveConfig } from './config/resolve';
export { DEFAULT_CONFIG } from './config/defaults';
export type { StargazerConfig, ResolvedConfig } from './config/types';

// =============================================================================
// Main Facade
// =============================================================================
export { createStargazer } from './stargazer';
export type { Stargazer, StargazerOptions, ReviewOptions } from './stargazer';
```

## Test

```bash
cd packages/core && pnpm build
```

Package builds successfully with all exports accessible.
