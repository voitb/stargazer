---
id: task-089
title: Add --staged explicit flag
status: done
priority: low
labels:
  - cli
  - commands
created: '2026-01-06'
order: 890
assignee: voitb
---
## Description

Add explicit `--staged` flag for documentation and clarity.

## Issue Details

**File**: `/packages/cli/src/commands/review.ts:19`
**Confidence**: 80%
**Category**: Documentation

The command has `--unstaged` to review unstaged changes, but there's no explicit `--staged` flag. While staged is the default, having both flags makes the CLI more self-documenting and allows users to be explicit.

## Acceptance Criteria

- [x] Add `--staged` option (default: true)
- [x] Make `--staged` and `--unstaged` mutually exclusive
- [x] Update help text to show default behavior

## Implementation

**File**: `packages/cli/src/commands/review.ts`

```typescript
export const reviewCommand = new Command('review')
  .description('Review code changes using AI')
  .option('--staged', 'Review staged changes (default)')
  .option('--unstaged', 'Review unstaged changes')
  .action(async (options) => {
    // Handle mutually exclusive options
    if (options.staged && options.unstaged) {
      exitWithError('Cannot use both --staged and --unstaged');
    }

    const staged = !options.unstaged; // Default to staged

    const result = await reviewDiff(client, {
      staged,
      projectPath: process.cwd(),
    });

    // ...
  });
```

## Test

```bash
cd packages/cli && pnpm build

# Test explicit flags
pnpm stargazer review --staged
pnpm stargazer review --unstaged

# Test mutual exclusivity
pnpm stargazer review --staged --unstaged  # Should error
```
