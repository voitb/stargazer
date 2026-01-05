import { describe, it, expect } from 'vitest';
import { createGeminiClient } from '../gemini/client';
import { reviewDiff } from './reviewer';

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
  }, 30000);

  it('returns error for empty diff', async () => {
    const client = createGeminiClient(process.env.GEMINI_API_KEY!);

    const result = await reviewDiff(client, { diff: '' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EMPTY_RESPONSE');
    }
  });
});
