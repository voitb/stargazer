---
id: task-018
title: Create IssueSchema
status: todo
priority: high
labels:
  - core
  - review
  - schemas
created: '2026-01-01'
order: 180
---
## Description

Create the full Issue schema with all fields.

## Acceptance Criteria

- [ ] Add `IssueSchema` to `schemas.ts`
- [ ] All fields have `.describe()` for Gemini
- [ ] Export `Issue` type
- [ ] Schema roundtrip works with sample data

## Implementation

**File**: `packages/core/src/review/schemas.ts` (extend)

```typescript
export const IssueSchema = z.object({
  file: z.string().describe('Relative path to the file'),
  line: z.number().int().positive().describe('Line number'),
  severity: SeveritySchema,
  category: CategorySchema,
  message: z.string().describe('Clear description of the issue'),
  suggestion: z.string().optional().describe('Suggested fix'),
  confidence: z.number().min(0).max(1).describe('Confidence score 0-1'),
}).describe('A single code review issue');

export type Issue = z.infer<typeof IssueSchema>;
```

## Test

```typescript
const issue = IssueSchema.parse({
  file: 'src/main.ts',
  line: 10,
  severity: 'high',
  category: 'bug',
  message: 'Missing null check',
  confidence: 0.9,
});
```
