---
id: task-020
title: Create ReviewResultSchema
status: done
assignee: voitb
priority: high
labels:
  - core
  - review
  - schemas
created: '2026-01-01'
order: 200
---
## Description

Create the complete ReviewResult schema and export JSON schema for Gemini.

## Acceptance Criteria

- [x] Add `ReviewResultSchema` to `schemas.ts`
- [x] Export `ReviewResult` type
- [x] Export `ReviewResultJSONSchema` using OpenAPI 3.0 target
- [x] JSON schema is valid OpenAPI 3.0

## Implementation

**File**: `packages/core/src/review/schemas.ts` (extend)

```typescript
export const ReviewResultSchema = z.object({
  issues: z.array(IssueSchema).describe('List of issues found'),
  summary: z.string().describe('Brief summary of the review'),
  decision: DecisionSchema,
}).describe('Complete code review result');

export type ReviewResult = z.infer<typeof ReviewResultSchema>;

// Export JSON Schema for Gemini
export const ReviewResultJSONSchema = z.toJSONSchema(ReviewResultSchema, {
  target: 'openapi-3.0',
});
```

## Test

JSON schema is valid and includes all fields.
