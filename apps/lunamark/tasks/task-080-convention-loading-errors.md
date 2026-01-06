---
id: task-080
title: Add convention loading error handling
status: done
priority: high
labels:
  - core
  - review
created: '2026-01-06'
order: 800
assignee: voitb
---
## Description

Add proper error handling when convention loading fails instead of silently swallowing errors.

## Issue Details

**File**: `/packages/core/src/review/reviewer.ts:38-43`
**Confidence**: 88%
**Category**: Error Handling

Current code:
```typescript
if (projectPath) {
  const conventionsResult = await loadConventions(projectPath);
  if (conventionsResult.ok) {
    conventions = conventionsResult.data;
  }
  // Error is silently ignored!
}
```

If conventions fail to load (e.g., corrupted cache, permission issues), the error is silently swallowed. This could lead to reviews that unexpectedly lack convention context without any indication to the user.

## Acceptance Criteria

- [x] Add `warnings` field to `ReviewResult` type
- [x] Include convention loading errors as warnings
- [x] Log warning when conventions fail to load
- [x] Display warnings in CLI output

## Implementation

**File**: `packages/core/src/review/types.ts`

```typescript
export interface ReviewResult {
  readonly issues: readonly Issue[];
  readonly summary: string;
  readonly decision: Decision;
  readonly warnings?: readonly string[]; // NEW
}
```

**File**: `packages/core/src/review/reviewer.ts`

```typescript
const warnings: string[] = [];

if (projectPath) {
  const conventionsResult = await loadConventions(projectPath);
  if (conventionsResult.ok) {
    conventions = conventionsResult.data;
  } else {
    warnings.push(`Could not load conventions: ${conventionsResult.error.message}`);
    console.warn(`[Stargazer] ${warnings[warnings.length - 1]}`);
  }
}

// Include warnings in result
return ok({
  ...reviewResult,
  warnings: warnings.length > 0 ? warnings : undefined,
});
```

## Test

```bash
cd packages/core && pnpm test reviewer.test.ts
```

Test with corrupted/missing conventions file.
