---
id: task-015
title: Test Gemini connection (live)
status: done
assignee: voitb
priority: high
labels:
  - core
  - gemini
  - testing
created: '2026-01-01'
order: 150
---
## Description

Write a live test to verify the Gemini API connection works with structured output.

## Acceptance Criteria

- [x] Add live test to `packages/core/src/gemini/client.test.ts`
- [x] Test connects to Gemini and returns structured data
- [x] Test passes with valid API key

## Implementation

**File**: `packages/core/src/gemini/client.test.ts` (extend)

```typescript
import { describe, it, expect } from 'vitest';
import { createGeminiClient } from './client';

describe('createGeminiClient', () => {
  it('connects to Gemini and returns structured data', async () => {
    const client = createGeminiClient(process.env.GEMINI_API_KEY!);

    const result = await client.generate(
      'Say hello and pick a random number between 1-100',
      TestSchema
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.data.message).toBe('string');
      expect(typeof result.data.number).toBe('number');
    }
  });
});
```

## Test

```bash
GEMINI_API_KEY=xxx pnpm test client.test.ts
```
