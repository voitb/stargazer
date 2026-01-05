---
id: task-038
title: Create saveConventions function
status: todo
assignee: voitb
priority: medium
labels:
  - core
  - conventions
created: '2026-01-01'
order: 380
---
## Description

Create function to save discovered conventions to a cache file.

## Acceptance Criteria

- [ ] Create `packages/core/src/conventions/cache.ts`
- [ ] Implement `saveConventions()` function
- [ ] Save to `.stargazer/conventions.json`
- [ ] Create directory if needed
- [ ] Return Result type

## Implementation

**File**: `packages/core/src/conventions/cache.ts`

```typescript
import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { ok, err } from '../shared/result';
import type { Result } from '../shared/result';
import type { ProjectConventions } from './schemas';

const CACHE_FILE = '.stargazer/conventions.json';

export async function saveConventions(
  conventions: ProjectConventions,
  projectDir: string
): Promise<Result<void>> {
  try {
    const filePath = join(projectDir, CACHE_FILE);

    // Create directory if it doesn't exist
    await mkdir(dirname(filePath), { recursive: true });

    // Write conventions to file
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
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
