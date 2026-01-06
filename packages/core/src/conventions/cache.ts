import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { ok, err, type Result } from '../shared/result';
import type { ApiError } from '../shared/error-codes';
import type { ProjectConventions } from './types';
import { ProjectConventionsSchema } from './schemas';

const CACHE_DIR = '.stargazer';
const CONVENTIONS_FILE = 'conventions.json';

function getCachePath(projectPath: string): string {
  return join(projectPath, CACHE_DIR, CONVENTIONS_FILE);
}

export async function saveConventions(
  projectPath: string,
  conventions: ProjectConventions
): Promise<Result<void>> {
  const cachePath = getCachePath(projectPath);

  try {
    await mkdir(dirname(cachePath), { recursive: true });

    const json = JSON.stringify(conventions, null, 2);
    await writeFile(cachePath, json, 'utf-8');

    return ok(undefined);
  } catch (error) {
    return err({
      code: 'FILE_NOT_FOUND',
      message: `Failed to save conventions: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

export async function loadConventions(
  projectPath: string
): Promise<Result<ProjectConventions | null>> {
  const cachePath = getCachePath(projectPath);

  try {
    await access(cachePath);
  } catch {
    return ok(null);
  }

  try {
    const content = await readFile(cachePath, 'utf-8');
    const data = JSON.parse(content);

    const parsed = ProjectConventionsSchema.safeParse(data);
    if (!parsed.success) {
      return err({
        code: 'SCHEMA_VALIDATION',
        message: `Invalid conventions cache: ${parsed.error.message}`,
      });
    }

    return ok(parsed.data);
  } catch (error) {
    return err({
      code: 'FILE_NOT_FOUND',
      message: `Failed to load conventions: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}
