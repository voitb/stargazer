---
id: task-037
title: Create discoverConventions function
status: todo
assignee: voitb
priority: high
labels:
  - core
  - conventions
created: '2026-01-01'
order: 370
---
## Description

Create the main convention discovery function.

## Acceptance Criteria

- [ ] Create `packages/core/src/conventions/discovery.ts`
- [ ] Implement `discoverConventions()` function
- [ ] Read project files and call Gemini
- [ ] Return Result<ProjectConventions>

## Implementation

**File**: `packages/core/src/conventions/discovery.ts`

```typescript
import type { Result } from '../shared/result';
import type { GeminiClient } from '../gemini/types';
import { readProjectFiles } from './files';
import { buildDiscoveryPrompt } from './prompts';
import { ProjectConventionsSchema } from './schemas';
import type { ProjectConventions } from './schemas';

export type DiscoveryOptions = {
  readonly fileLimit?: number;
};

export async function discoverConventions(
  client: GeminiClient,
  projectDir: string,
  options: DiscoveryOptions = {}
): Promise<Result<ProjectConventions>> {
  const { fileLimit = 10 } = options;

  // Read project files
  const filesResult = await readProjectFiles(projectDir, fileLimit);
  if (!filesResult.ok) return filesResult;

  if (filesResult.data.length === 0) {
    return {
      ok: false,
      error: {
        code: 'FILE_NOT_FOUND',
        message: 'No code files found in project directory',
      },
    };
  }

  // Build prompt and call Gemini
  const prompt = buildDiscoveryPrompt(filesResult.data);
  return client.generate(prompt, ProjectConventionsSchema);
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
