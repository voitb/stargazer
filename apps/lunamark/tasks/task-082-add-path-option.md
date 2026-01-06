---
id: task-082
title: Add --path option for project directory
status: done
priority: medium
labels:
  - cli
  - commands
created: '2026-01-06'
order: 820
assignee: voitb
---
## Description

Add `--path` option to allow reviewing or discovering conventions in a different directory.

## Issue Details

**Files**:
- `/packages/cli/src/commands/review.ts`
- `/packages/cli/src/commands/discover.ts`

**Confidence**: 86%
**Category**: Feature

Both commands hardcode `process.cwd()` as the project path. Users cannot review or discover conventions in a different directory without changing their working directory.

## Acceptance Criteria

- [x] Add `--path <directory>` option to review command
- [x] Add `--path <directory>` option to discover command
- [x] Validate that the path exists and is a directory
- [x] Default to `process.cwd()` when not specified

## Implementation

**File**: `packages/cli/src/commands/review.ts`

```typescript
import { access, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

export const reviewCommand = new Command('review')
  .description('Review staged changes using AI')
  .option('--unstaged', 'Review unstaged changes instead of staged')
  .option('-p, --path <directory>', 'Project directory to review', process.cwd())
  .option('-f, --format <format>', 'Output format: terminal, json, markdown', 'terminal')
  .option('-m, --model <model>', 'Gemini model to use')
  .action(async (options) => {
    // Validate path
    const projectPath = resolve(options.path);
    try {
      const stats = await stat(projectPath);
      if (!stats.isDirectory()) {
        exitWithError(`Path is not a directory: ${projectPath}`);
      }
    } catch {
      exitWithError(`Path does not exist: ${projectPath}`);
    }

    // Use projectPath in review
    const result = await reviewDiff(client, {
      staged: !options.unstaged,
      projectPath,
    });
    // ...
  });
```

**File**: `packages/cli/src/commands/discover.ts`

```typescript
export const discoverCommand = new Command('discover')
  .description('Discover project conventions')
  .option('-p, --path <directory>', 'Project directory to analyze', process.cwd())
  .option('--max-files <number>', 'Maximum files to analyze', '20')
  .action(async (options) => {
    const projectPath = resolve(options.path);
    // ... validate and use projectPath
  });
```

## Test

```bash
cd packages/cli && pnpm build

# Test with different directory
pnpm stargazer review --path /path/to/other/project
pnpm stargazer discover --path /path/to/other/project
```
