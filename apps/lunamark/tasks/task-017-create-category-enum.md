---
id: task-017
title: Create IssueCategory enum
status: done
assignee: voitb
priority: high
labels:
  - core
  - review
  - schemas
created: '2026-01-01'
order: 170
---
## Description

Create the issue category enum schema.

## Acceptance Criteria

- [x] Add `CATEGORIES` and `CategorySchema` to `schemas.ts`
- [x] Export `Category` type

## Implementation

**File**: `packages/core/src/review/schemas.ts` (extend)

```typescript
export const CATEGORIES = ['bug', 'security', 'convention', 'performance'] as const;
export const CategorySchema = z.enum(CATEGORIES).describe('Issue category');
export type Category = z.infer<typeof CategorySchema>;
```

## Test

TypeScript compiles.
