---
id: task-075
title: Add diff size validation
status: done
priority: critical
labels:
  - core
  - review
created: '2026-01-06'
order: 750
assignee: voitb
---
## Description

Add size validation for diffs to prevent token overflow and excessive API costs.

## Issue Details

**File**: `/packages/core/src/review/reviewer.ts:18-28`
**Confidence**: 92%
**Category**: Reliability

The code accepts arbitrarily large diffs without any size validation. A large diff could:
- Exceed Gemini's context window limits
- Cause excessive API costs
- Result in truncated or low-quality reviews

## Acceptance Criteria

- [x] Add `MAX_DIFF_SIZE` constant (e.g., 100,000 characters)
- [x] Validate diff size before API call
- [x] Return structured error if diff is too large
- [x] Add config option to customize max size

## Implementation

**File**: `packages/core/src/review/reviewer.ts`

```typescript
const MAX_DIFF_SIZE = 100_000; // characters

export async function reviewDiff(
  client: GeminiClient,
  options: ReviewOptions = {}
): Promise<Result<ReviewResult>> {
  // ... existing diff retrieval code ...

  // Add size validation
  if (diff.length > MAX_DIFF_SIZE) {
    return err({
      code: 'BAD_REQUEST',
      message: `Diff too large (${diff.length} chars). Maximum is ${MAX_DIFF_SIZE} chars. Consider reviewing smaller changesets.`,
    });
  }

  // ... rest of implementation
}
```

## Test

```bash
cd packages/core && pnpm test reviewer.test.ts
```

Test with large diffs to verify the limit is enforced.
