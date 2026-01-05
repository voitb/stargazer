import { describe, it, expect } from 'vitest';
import * as z from 'zod';
import { createGeminiClient } from './client';

const TestSchema = z.object({
  message: z.string().describe('A greeting message'),
  number: z.number().describe('A random number between 1 and 100'),
});

type TestResponse = z.infer<typeof TestSchema>;

describe('createGeminiClient', () => {
  it('connects to Gemini and returns structured data', async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    const client = createGeminiClient(apiKey);

    const result = await client.generate(
      'Say hello and pick a random number between 1 and 100. Return JSON with message and number fields.',
      TestSchema
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.data.message).toBe('string');
      expect(typeof result.data.number).toBe('number');
      expect(result.data.number).toBeGreaterThanOrEqual(1);
      expect(result.data.number).toBeLessThanOrEqual(100);
    }
  });
});
