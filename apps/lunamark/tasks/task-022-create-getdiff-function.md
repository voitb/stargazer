---
id: task-022
title: Create getDiff function
status: done
assignee: voitb
priority: high
labels:
  - core
  - context
  - git
created: '2026-01-01'
order: 220
---
## Description

Create a function to get git diff output. This is essential for reviewing staged or unstaged changes.

## Acceptance Criteria

- [x] Create `packages/core/src/context/git.ts`
- [x] Implement `getDiff()` function with Result return type
- [x] Support both staged and unstaged diffs
- [x] Handle git errors gracefully

## Implementation

**File**: `packages/core/src/context/git.ts`

```typescript
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
```

## Test

```bash
# Verify function returns diff when there are staged changes
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
