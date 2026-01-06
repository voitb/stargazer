---
id: task-096
title: Create storage paths utility
status: pending
priority: high
labels:
  - cli
  - tui
  - storage
created: '2025-01-06'
order: 96
assignee: glm
---

## Description

Create the storage paths utility module that defines where TUI session data is stored (~/.stargazer/).

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/storage/paths.ts`
- [ ] Export `getStargazerDir()` returning `~/.stargazer`
- [ ] Export `getSessionsDir()` returning `~/.stargazer/sessions`
- [ ] Export `getSessionDir(id)` for individual session directories
- [ ] Export `getSessionIndexPath()` for the index file
- [ ] Export `ensureDir()` and `ensureStorageStructure()` helpers

## Implementation

**File**: `packages/cli/src/tui/storage/paths.ts`

```typescript
import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdir } from 'node:fs/promises';

export function getStargazerDir(): string {
  return join(homedir(), '.stargazer');
}

export function getSessionsDir(): string {
  return join(getStargazerDir(), 'sessions');
}

export function getSessionDir(sessionId: string): string {
  return join(getSessionsDir(), sessionId);
}

export function getSessionIndexPath(): string {
  return join(getSessionsDir(), 'index.json');
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function ensureStorageStructure(): Promise<void> {
  await ensureDir(getStargazerDir());
  await ensureDir(getSessionsDir());
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
