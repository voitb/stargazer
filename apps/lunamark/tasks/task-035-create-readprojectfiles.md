---
id: task-035
title: Create readProjectFiles helper
status: done
assignee: voitb
priority: medium
labels:
  - core
  - conventions
created: '2026-01-01'
order: 350
---
## Description

Create a helper to read code files from a project directory for analysis.

## Acceptance Criteria

- [x] Create `packages/core/src/conventions/files.ts`
- [x] Implement `readProjectFiles()` function
- [x] Filter to only code files (.ts, .tsx, .js, .jsx)
- [x] Limit number of files to avoid token overload
- [x] Return Result type

## Implementation

**File**: `packages/core/src/conventions/files.ts`

```typescript
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { ok, err } from '../shared/result';
import type { Result } from '../shared/result';

const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const IGNORE_DIRS = ['node_modules', 'dist', '.git', 'coverage', '.next'];

export type FileContent = {
  readonly path: string;
  readonly content: string;
};

export async function readProjectFiles(
  dir: string,
  limit = 10
): Promise<Result<FileContent[]>> {
  try {
    const files = await findCodeFiles(dir, limit);
    const contents = await Promise.all(
      files.map(async (path) => ({
        path,
        content: await readFile(path, 'utf-8'),
      }))
    );
    return ok(contents);
  } catch (e) {
    return err({
      code: 'FILE_NOT_FOUND',
      message: `Failed to read project files: ${String(e)}`,
      cause: e,
    });
  }
}

async function findCodeFiles(dir: string, limit: number): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });

  return entries
    .filter((entry) => {
      if (!entry.isFile()) return false;
      if (!CODE_EXTENSIONS.includes(extname(entry.name))) return false;
      // Check if path contains ignored directories
      const fullPath = entry.parentPath || dir;
      if (IGNORE_DIRS.some((ignored) => fullPath.includes(ignored))) return false;
      return true;
    })
    .slice(0, limit)
    .map((entry) => join(entry.parentPath || dir, entry.name));
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
