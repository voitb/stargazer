---
id: task-039
title: Create loadConventions function
status: todo
priority: medium
labels:
  - core
  - conventions
created: '2026-01-01'
order: 390
---
## Description

Create function to load cached conventions from file.

## Acceptance Criteria

- [ ] Extend `packages/core/src/conventions/cache.ts`
- [ ] Implement `loadConventions()` function
- [ ] Validate with Zod schema
- [ ] Return Result type

## Implementation

**File**: `packages/core/src/conventions/cache.ts` (extend)

```typescript
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { ok, err } from '../shared/result';
import type { Result } from '../shared/result';
import { ProjectConventionsSchema } from './schemas';
import type { ProjectConventions } from './schemas';

const CACHE_FILE = '.stargazer/conventions.json';

export async function saveConventions(
  conventions: ProjectConventions,
  projectDir: string
): Promise<Result<void>> {
  try {
    const filePath = join(projectDir, CACHE_FILE);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(conventions, null, 2), 'utf-8');
    return ok(undefined);
  } catch (e) {
    return err({
      code: 'FILE_NOT_FOUND',
      message: `Failed to save conventions: ${String(e)}`,
      cause: e,
    });
  }
}

export async function loadConventions(
  projectDir: string
): Promise<Result<ProjectConventions>> {
  try {
    const filePath = join(projectDir, CACHE_FILE);
    const content = await readFile(filePath, 'utf-8');
    const json = JSON.parse(content);

    // Validate with Zod schema
    const parsed = ProjectConventionsSchema.safeParse(json);
    if (!parsed.success) {
      return err({
        code: 'SCHEMA_VALIDATION',
        message: `Invalid conventions file: ${parsed.error.message}`,
      });
    }

    return ok(parsed.data);
  } catch (e) {
    return err({
      code: 'FILE_NOT_FOUND',
      message: `Failed to load conventions: ${String(e)}`,
      cause: e,
    });
  }
}

export function getConventionsPath(projectDir: string): string {
  return join(projectDir, CACHE_FILE);
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
