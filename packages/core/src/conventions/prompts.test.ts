import { describe, it, expect } from 'vitest';
import { buildDiscoveryPrompt } from './prompts';
import type { FileContext } from './types';

describe('buildDiscoveryPrompt', () => {
  it('should include all file contents', () => {
    const files: FileContext[] = [
      { path: 'src/utils.ts', content: 'export function utils() {}' },
      { path: 'src/helpers.ts', content: 'export function helpers() {}' },
    ];

    const prompt = buildDiscoveryPrompt(files);

    expect(prompt).toContain('src/utils.ts');
    expect(prompt).toContain('src/helpers.ts');
    expect(prompt).toContain('export function utils()');
    expect(prompt).toContain('export function helpers()');
  });

  it('should include convention categories to discover', () => {
    const files: FileContext[] = [
      { path: 'test.ts', content: 'const x = 1;' },
    ];

    const prompt = buildDiscoveryPrompt(files);

    expect(prompt).toContain('Error Handling');
    expect(prompt).toContain('Naming');
    expect(prompt).toContain('Testing');
    expect(prompt).toContain('Imports');
  });

  it('should include response format instructions', () => {
    const files: FileContext[] = [
      { path: 'test.ts', content: 'const x = 1;' },
    ];

    const prompt = buildDiscoveryPrompt(files);

    expect(prompt).toContain('version');
    expect(prompt).toContain('1.0');
    expect(prompt).toContain('ProjectConventions');
  });

  it('should wrap code in typescript code blocks', () => {
    const files: FileContext[] = [
      { path: 'src/app.ts', content: 'export const app = true;' },
    ];

    const prompt = buildDiscoveryPrompt(files);

    expect(prompt).toContain('```typescript');
    expect(prompt).toContain('```');
  });

  it('should handle empty file array', () => {
    const files: FileContext[] = [];

    const prompt = buildDiscoveryPrompt(files);

    expect(prompt).toBeDefined();
    expect(prompt.length).toBeGreaterThan(0);
  });
});
