---
id: task-044
title: Add conventionRef to IssueSchema
status: todo
priority: low
labels:
  - core
  - review
created: '2026-01-01'
order: 440
---
## Description

Add the conventionRef field to IssueSchema so issues can reference violated conventions.

## Acceptance Criteria

- [ ] Update `packages/core/src/review/schemas.ts`
- [ ] Add optional conventionRef field to IssueSchema
- [ ] Field references convention name when violation detected

## Implementation

**File**: `packages/core/src/review/schemas.ts` (update IssueSchema)

```typescript
import * as z from 'zod/v4';

export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
export const SeveritySchema = z.enum(SEVERITIES).describe('Issue severity level');
export type Severity = z.infer<typeof SeveritySchema>;

export const CATEGORIES = ['bug', 'security', 'convention', 'performance'] as const;
export const CategorySchema = z.enum(CATEGORIES).describe('Issue category');
export type Category = z.infer<typeof CategorySchema>;

export const IssueSchema = z.object({
  file: z.string().describe('Relative path to the file'),
  line: z.number().int().positive().describe('Line number where issue was found'),
  severity: SeveritySchema,
  category: CategorySchema,
  message: z.string().describe('Clear description of the issue'),
  suggestion: z.string().optional().describe('Suggested fix for the issue'),
  confidence: z.number().min(0).max(1).describe('Confidence score between 0 and 1'),
  conventionRef: z.string().optional().describe('Name of the violated convention, if applicable'),
}).describe('A single code review issue');

export type Issue = z.infer<typeof IssueSchema>;

export const DECISIONS = ['approve', 'request_changes', 'comment'] as const;
export const DecisionSchema = z.enum(DECISIONS).describe('Overall review decision');
export type Decision = z.infer<typeof DecisionSchema>;

export const ReviewResultSchema = z.object({
  issues: z.array(IssueSchema).describe('List of issues found in the code'),
  summary: z.string().describe('Brief summary of the overall code quality'),
  decision: DecisionSchema,
}).describe('Complete code review result');

export type ReviewResult = z.infer<typeof ReviewResultSchema>;

// Export JSON Schema for Gemini (OpenAPI 3.0 target)
export const ReviewResultJSONSchema = z.toJSONSchema(ReviewResultSchema, {
  target: 'openapi-3.0',
});
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors. Schema includes conventionRef field.
