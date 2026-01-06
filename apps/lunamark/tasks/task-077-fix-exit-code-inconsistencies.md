---
id: task-077
title: Fix CLI exit code inconsistencies
status: done
priority: high
labels:
  - cli
  - commands
created: '2026-01-06'
order: 770
assignee: voitb
---
## Description

Fix inconsistent exit code usage across CLI commands.

## Issue Details

**Files**:
- `/packages/cli/src/commands/discover.ts:16-17, 33-34`
- `/packages/cli/src/commands/init.ts:32`

**Confidence**: 95%
**Category**: Consistency

Issues found:
1. `discover.ts` uses raw `process.exit(2)` and `console.error()` instead of `exitWithError()`
2. `init.ts` uses `EXIT_CODES.ISSUES_FOUND` (1) for existing config, which is semantically wrong - should be `EXIT_CODES.ERROR` (2)

## Acceptance Criteria

- [x] Update `discover.ts` to use `exitWithError()` consistently
- [x] Fix `init.ts` to use correct exit code for existing config
- [x] Ensure all error messages go through `exitWithError()`
- [x] Add explicit `process.exit(0)` for successful discover command

## Implementation

**File**: `packages/cli/src/commands/discover.ts`

```typescript
import { exitWithError } from '../exit-codes';

// Replace:
// console.error(chalk.red('Error: GEMINI_API_KEY...'));
// process.exit(2);

// With:
exitWithError('GEMINI_API_KEY environment variable is required\nSet it with: export GEMINI_API_KEY=your-key');
```

**File**: `packages/cli/src/commands/init.ts`

```typescript
// Replace:
process.exit(EXIT_CODES.ISSUES_FOUND);

// With:
process.exit(EXIT_CODES.ERROR);
```

## Test

```bash
cd packages/cli && pnpm build

# Test discover without API key
unset GEMINI_API_KEY && pnpm stargazer discover; echo "Exit: $?"

# Test init with existing config
touch stargazer.config.ts && pnpm stargazer init; echo "Exit: $?"
```

Both should exit with code 2.
