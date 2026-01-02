---
id: task-016
title: Create IssueSeverity enum
status: todo
priority: high
labels:
  - core
  - review
  - schemas
created: '2026-01-01'
order: 160
---
## Description

Create the issue severity enum schema.

## Acceptance Criteria

- [ ] Create `packages/core/src/review/schemas.ts`
- [ ] Define `SEVERITIES` constant and `SeveritySchema`
- [ ] Export `Severity` type

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
