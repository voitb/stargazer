---
id: task-017
title: Create IssueCategory enum
status: todo
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

- [ ] Add `CATEGORIES` and `CategorySchema` to `schemas.ts`
- [ ] Export `Category` type

## Implementation

**File**: `packages/core/src/review/schemas.ts` (extend)

```typescript
export const CATEGORIES = ['bug', 'security', 'convention', 'performance'] as const;
export const CategorySchema = z.enum(CATEGORIES).describe('Issue category');
export type Category = z.infer<typeof CategorySchema>;
```

## Test

TypeScript compiles.
