import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readProjectFiles } from './file-reader';

describe('readProjectFiles', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `stargazer-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should read TypeScript files', async () => {
    await mkdir(join(testDir, 'src'), { recursive: true });
    await writeFile(
      join(testDir, 'src/index.ts'),
      'export function hello() { return "world"; }\n'.repeat(10)
    );

    const result = await readProjectFiles(testDir);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.length).toBe(1);
      expect(result.data[0].path).toBe('src/index.ts');
    }
  });

  it('should ignore node_modules', async () => {
    await mkdir(join(testDir, 'node_modules/pkg'), { recursive: true });
    await mkdir(join(testDir, 'src'), { recursive: true });

    await writeFile(
      join(testDir, 'node_modules/pkg/index.ts'),
      'export const pkg = true;\n'.repeat(10)
    );
    await writeFile(
      join(testDir, 'src/app.ts'),
      'export const app = true;\n'.repeat(10)
    );

    const result = await readProjectFiles(testDir);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.length).toBe(1);
      expect(result.data[0].path).toBe('src/app.ts');
    }
  });

  it('should ignore dist directory', async () => {
    await mkdir(join(testDir, 'dist'), { recursive: true });
    await mkdir(join(testDir, 'src'), { recursive: true });

    await writeFile(
      join(testDir, 'dist/bundle.js'),
      'var x = 1;\n'.repeat(20)
    );
    await writeFile(
      join(testDir, 'src/main.ts'),
      'export const main = 1;\n'.repeat(10)
    );

    const result = await readProjectFiles(testDir);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.every(f => !f.path.startsWith('dist/'))).toBe(true);
    }
  });

  it('should respect maxFiles limit', async () => {
    await mkdir(join(testDir, 'src'), { recursive: true });

    // Create 10 files
    for (let i = 0; i < 10; i++) {
      await writeFile(
        join(testDir, `src/file${i}.ts`),
        `export const file${i} = ${i};\n`.repeat(10)
      );
    }

    const result = await readProjectFiles(testDir, 3);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.length).toBeLessThanOrEqual(3);
    }
  });

  it('should skip files smaller than 100 characters', async () => {
    await mkdir(join(testDir, 'src'), { recursive: true });

    await writeFile(join(testDir, 'src/tiny.ts'), 'export const x = 1;');
    await writeFile(
      join(testDir, 'src/normal.ts'),
      'export const normal = true;\n'.repeat(10)
    );

    const result = await readProjectFiles(testDir);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.length).toBe(1);
      expect(result.data[0].path).toBe('src/normal.ts');
    }
  });

  it('should return empty array for directory with no matching files', async () => {
    await mkdir(join(testDir, 'docs'), { recursive: true });
    await writeFile(join(testDir, 'docs/readme.md'), '# Readme\n'.repeat(20));

    const result = await readProjectFiles(testDir);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.length).toBe(0);
    }
  });

  it('should include .tsx and .jsx files', async () => {
    await mkdir(join(testDir, 'src'), { recursive: true });

    await writeFile(
      join(testDir, 'src/Component.tsx'),
      'export function Component() { return <div>Hello</div>; }\n'.repeat(5)
    );
    await writeFile(
      join(testDir, 'src/Legacy.jsx'),
      'export function Legacy() { return <span>Old</span>; }\n'.repeat(5)
    );

    const result = await readProjectFiles(testDir);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const paths = result.data.map(f => f.path);
      expect(paths).toContain('src/Component.tsx');
      expect(paths).toContain('src/Legacy.jsx');
    }
  });
});
