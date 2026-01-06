import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ok, err } from '../shared/result';
import type { Result } from '../shared/result';
import type { ApiError } from '../shared/error-codes';

const execFileAsync = promisify(execFile);

/**
 * Get git diff for staged or unstaged changes.
 * Uses execFile for security (no shell interpolation).
 */
export async function getDiff(staged = true): Promise<Result<string>> {
  try {
    const args = staged ? ['diff', '--staged'] : ['diff'];
    const { stdout } = await execFileAsync('git', args);
    return ok(stdout);
  } catch (e) {
    return err({
      code: 'GIT_ERROR',
      message: `Failed to get git diff: ${String(e)}`,
      cause: e,
    } satisfies ApiError);
  }
}
