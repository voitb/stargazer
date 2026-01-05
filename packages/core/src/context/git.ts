import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { ok, err } from '../shared/result';
import type { Result } from '../shared/result';
import type { ApiError } from '../shared/error-codes';

const execAsync = promisify(exec);

export async function getDiff(staged = true): Promise<Result<string>> {
  try {
    const flag = staged ? '--staged' : '';
    const { stdout } = await execAsync(`git diff ${flag}`);
    return ok(stdout);
  } catch (e) {
    return err({
      code: 'GIT_ERROR',
      message: `Failed to get git diff: ${String(e)}`,
      cause: e,
    } satisfies ApiError);
  }
}
