---
id: task-021
title: Test schemas with Gemini
status: todo
priority: high
labels:
  - core
  - review
  - testing
created: '2026-01-01'
order: 210
---
## Description

Verify schemas work with Gemini structured output.

## Acceptance Criteria

- [ ] Create `packages/core/src/review/schemas.test.ts`
- [ ] Test Gemini returns typed ReviewResult
- [ ] Test passes with valid API key

## Implementation

**File**: `packages/core/src/review/schemas.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createGeminiClient } from '../gemini/client';
import { ReviewResultSchema } from './schemas';

describe('ReviewResultSchema with Gemini', () => {
  it('gets typed review from Gemini', async () => {
    const client = createGeminiClient(process.env.GEMINI_API_KEY!);

    const sampleCode = \`
function add(a, b) {
  return a + b  // missing semicolon
}
\`;

    const result = await client.generate(
      \`Review this code and find issues:\\n\${sampleCode}\`,
      ReviewResultSchema
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Array.isArray(result.data.issues)).toBe(true);
      expect(typeof result.data.summary).toBe('string');
    }
  });
});
```

## Test

```bash
GEMINI_API_KEY=xxx pnpm test schemas.test.ts
```
