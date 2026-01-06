---
id: task-079
title: Fix plugin type mutability issues
status: done
priority: high
labels:
  - core
  - plugins
  - types
created: '2026-01-06'
order: 790
assignee: voitb
---
## Description

Fix type safety issues in the plugin system where mutable arrays break the immutability contract.

## Issue Details

**File**: `/packages/core/src/plugins/types.ts`
**Confidence**: 85%
**Category**: Type Safety

Issues found:
1. `afterReview` uses mutable `Issue[]` instead of `readonly Issue[]`
2. Inline type duplicates `ReviewResult` structure instead of referencing it
3. `decision` uses `string` instead of `Decision` type

## Acceptance Criteria

- [x] Update `StargazerPlugin` to use `ReviewResult` type
- [x] Use `readonly Issue[]` in `filterIssues`
- [x] Use `Decision` type instead of `string`
- [x] Ensure type consistency across plugin hooks

## Implementation

**File**: `packages/core/src/plugins/types.ts`

```typescript
import type { ReviewResult, Issue, Decision } from '../review/types';

export interface StargazerPlugin {
  readonly name: string;

  readonly beforeReview?: (ctx: ReviewContext) => void | Promise<void>;

  readonly afterReview?: (
    result: ReviewResult,
    ctx: ReviewContext
  ) => ReviewResult | Promise<ReviewResult>;

  readonly filterIssues?: (
    issues: readonly Issue[],
    ctx: ReviewContext
  ) => readonly Issue[];
}

export interface ReviewContext {
  readonly diff: string;
  readonly projectPath?: string;
  readonly conventions?: ProjectConventions;
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript should compile without errors and enforce readonly constraints.
