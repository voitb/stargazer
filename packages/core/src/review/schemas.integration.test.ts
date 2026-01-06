import { describe, it, expect } from 'vitest';
import { createGeminiClient } from '../gemini/client';
import { ReviewResultSchema } from './schemas';

describe('ReviewResultSchema with Gemini', () => {
  it('gets typed review from Gemini', { timeout: 30000 }, async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('Skipping Gemini test - no API key');
      return;
    }

    const client = createGeminiClient(apiKey);

    const sampleCode = `
function add(a, b) {
  return a + b  // missing semicolon
}
`;

    const result = await client.generate(
      `Review this code and find issues:\n${sampleCode}`,
      ReviewResultSchema
    );

    if (!result.ok) {
      console.error('Gemini error:', result.error);
    }
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Array.isArray(result.data.issues)).toBe(true);
      expect(typeof result.data.summary).toBe('string');
      expect(['approve', 'request_changes', 'comment']).toContain(result.data.decision);
    }
  });
});
