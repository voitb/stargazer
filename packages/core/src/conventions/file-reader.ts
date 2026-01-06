import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import type { FileContext } from './types';
import { ok, err, type Result } from '../shared/result';
import type { ApiError } from '../shared/error-codes';

const INCLUDED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git', 'coverage', '.next', 'build']);

export async function readProjectFiles(
  rootPath: string,
  maxFiles: number = 50
): Promise<Result<readonly FileContext[]>> {
  const files: FileContext[] = [];

  async function walkDir(dirPath: string): Promise<void> {
    if (files.length >= maxFiles) return;

    let entries;
    try {
      entries = await readdir(dirPath, { withFileTypes: true });
    } catch (error) {
      return;
    }

    for (const entry of entries) {
      if (files.length >= maxFiles) break;

      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        await walkDir(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        if (!INCLUDED_EXTENSIONS.has(ext)) continue;

        try {
          const content = await readFile(fullPath, 'utf-8');
          if (content.length < 100) continue;
          if (content.length > 50000) continue;

          files.push({
            path: relative(rootPath, fullPath),
            content,
          });
        } catch {
          continue;
        }
      }
    }
  }

  try {
    await walkDir(rootPath);
    return ok(files);
  } catch (error) {
    return err({
      code: 'FILE_NOT_FOUND',
      message: `Failed to read project files: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}
