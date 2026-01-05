---
id: task-016
title: Create IssueSeverity enum
status: done
assignee: voitb
priority: high
labels:
  - core
  - review
  - schemas
created: '2026-01-01'
order: 85
---
## Description

Create the issue severity enum schema.

## Acceptance Criteria

- [x] Create `packages/core/src/review/schemas.ts`
- [x] Define `SEVERITIES` constant and `SeveritySchema`
- [x] Export `Severity` type

## Implementation

**File**: `packages/core/src/review/schemas.ts`

```typescript
import * as z from 'zod/v4';

export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
export const SeveritySchema = z.enum(SEVERITIES).describe('Issue severity level');
export type Severity = z.infer<typeof SeveritySchema>;
```

## Test

TypeScript compiles.
