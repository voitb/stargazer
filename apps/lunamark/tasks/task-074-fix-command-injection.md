---
id: task-074
title: Fix command injection vulnerability in git.ts
status: done
priority: critical
labels:
  - core
  - security
created: '2026-01-06'
order: 740
assignee: voitb
---
## Description

Fix potential command injection vulnerability in git diff command execution.

## Issue Details

**File**: `/packages/core/src/context/git.ts:12`
**Confidence**: 95%
**Category**: Security

The current implementation uses string interpolation with `exec`:
```typescript
const { stdout } = await execAsync(`git diff ${flag}`);
```

While the `flag` is currently controlled internally, this pattern is dangerous. If any user-controlled input ever flows into this command (e.g., file paths, branch names), it creates a command injection vulnerability.

## Acceptance Criteria

- [x] Replace `exec` with `execFile` using argument arrays
- [x] Ensure no string interpolation in shell commands
- [x] Add tests for the updated implementation

## Implementation

**File**: `packages/core/src/context/git.ts`

```typescript
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function getDiff(staged = true): Promise<string> {
  const args = staged ? ['diff', '--staged'] : ['diff'];
  const { stdout } = await execFileAsync('git', args);
  return stdout;
}
```

## Test

```bash
cd packages/core && pnpm test git.test.ts
```

Verify git operations still work correctly with the safer implementation.
