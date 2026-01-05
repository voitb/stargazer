---
id: task-026
title: Test full review flow
status: done
assignee: voitb
priority: high
labels:
  - core
  - review
  - testing
created: '2026-01-01'
order: 260
---
## Description

Create integration test for the full review flow with Gemini API.

## Acceptance Criteria

- [x] Create `packages/core/src/review/reviewer.integration.test.ts`
- [x] Test reviews staged changes successfully
- [x] Test handles empty diff
- [x] Test returns typed ReviewResult

## Implementation

**File**: `packages/core/src/review/reviewer.integration.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createGeminiClient } from '../gemini/client';
import { reviewDiff } from './review';

describe('reviewDiff', () => {
  it('reviews provided diff', async () => {
    const client = createGeminiClient(process.env.GEMINI_API_KEY!);

    const sampleDiff = `
diff --git a/src/app.ts b/src/app.ts
index 1234567..abcdefg 100644
--- a/src/app.ts
+++ b/src/app.ts
@@ -10,6 +10,7 @@ function processData(input: any) {
   const data = JSON.parse(input);
+  eval(data.code); // security issue
   return data;
 }
`;

    const result = await reviewDiff(client, { diff: sampleDiff });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Array.isArray(result.data.issues)).toBe(true);
      expect(typeof result.data.summary).toBe('string');
      expect(['approve', 'request_changes', 'comment']).toContain(result.data.decision);
    }
  });

  it('returns error for empty diff', async () => {
    const client = createGeminiClient(process.env.GEMINI_API_KEY!);

    const result = await reviewDiff(client, { diff: '' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EMPTY_RESPONSE');
    }
  });
});
```

## Test

```bash
GEMINI_API_KEY=xxx pnpm vitest run --project=integration reviewer.integration.test.ts
```
