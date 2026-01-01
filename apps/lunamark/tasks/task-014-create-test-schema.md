---
id: task-014
title: Create test schema for Gemini
status: todo
priority: medium
labels:
  - core
  - gemini
  - testing
created: '2026-01-01'
order: 140
---
## Description

Create a simple test schema to verify Gemini structured output works.

## Acceptance Criteria

- [ ] Create `packages/core/src/gemini/client.test.ts`
- [ ] Define simple `TestSchema`
- [ ] Schema compiles and JSON schema can be generated

## Implementation

**File**: `packages/core/src/gemini/client.test.ts`

```typescript
import * as z from 'zod/v4';

const TestSchema = z.object({
  message: z.string().describe('A greeting message'),
  number: z.number().describe('A random number'),
});

type TestResponse = z.infer<typeof TestSchema>;
```

## Test

Schema compiles, `z.toJSONSchema()` works.
