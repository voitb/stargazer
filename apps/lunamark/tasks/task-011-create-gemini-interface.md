---
id: task-011
title: Create GeminiClient interface
status: done
assignee: voitb
priority: high
labels:
  - core
  - gemini
  - types
created: '2026-01-01'
order: 17.5
---
## Description

Create the `GeminiClient` interface that defines the Gemini API wrapper.

## Acceptance Criteria

- [ ] Create `packages/core/src/gemini/types.ts`
- [ ] Define `GeminiClient` interface with `generate<T>()` method
- [ ] Define `GenerateOptions` interface
- [ ] TypeScript compiles with correct generic constraints

## Implementation

**File**: `packages/core/src/gemini/types.ts`

```typescript
import type * as z from 'zod/v4';
import type { Result } from '../shared/result';

export type GenerateOptions = {
  readonly model?: string;
  readonly temperature?: number;
};

export type GeminiClient = {
  readonly generate: <T extends z.ZodType>(
    prompt: string,
    schema: T,
    options?: GenerateOptions
  ) => Promise<Result<z.infer<T>>>;
};
```

## Test

TypeScript compiles without errors.
