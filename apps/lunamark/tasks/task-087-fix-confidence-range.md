---
id: task-087
title: Fix confidence range mismatch in prompt
status: done
priority: low
labels:
  - core
  - review
created: '2026-01-06'
order: 870
assignee: voitb
---
## Description

Fix the confidence range mismatch between schema (0-1) and prompt instructions.

## Issue Details

**Files**:
- `/packages/core/src/review/schemas.ts`
- `/packages/core/src/review/prompts.ts`

**Confidence**: 80%
**Category**: Correctness

The schema uses confidence `0-1`, but the prompt doesn't explicitly specify this range. LLMs often default to 0-100 scales. This mismatch could cause all confidence values to be incorrectly low.

## Acceptance Criteria

- [x] Add explicit confidence range instruction in prompt
- [x] Consider adding examples of expected confidence values
- [x] Update schema description for clarity

## Implementation

**File**: `packages/core/src/review/prompts.ts`

```typescript
// In the prompt template, update the confidence description:
`For each issue found, provide:
- The file path and line number
- Severity (critical, high, medium, low)
- Category (bug, security, convention, performance)
- Clear description of the issue
- Specific suggestion for fixing it
- Confidence score from 0.0 to 1.0 (e.g., 0.9 for highly confident, 0.5 for uncertain)
- Convention reference if applicable`
```

**File**: `packages/core/src/review/schemas.ts`

```typescript
export const IssueSchema = z.object({
  file: z.string().describe('File path where the issue was found'),
  line: z.number().int().min(1).describe('Line number (1-based)'),
  severity: SeveritySchema.describe('Issue severity level'),
  category: CategorySchema.describe('Issue category'),
  message: z.string().describe('Description of the issue'),
  suggestion: z.string().optional().describe('How to fix the issue'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence score from 0.0 (uncertain) to 1.0 (certain)'),
  conventionRef: z.string().optional().describe('Reference to violated convention'),
});
```

## Test

```bash
cd packages/core && pnpm test
```

Review some code and verify confidence values are in 0-1 range.
