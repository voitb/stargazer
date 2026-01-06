---
id: task-078
title: Add --max-files input validation
status: done
priority: high
labels:
  - cli
  - commands
created: '2026-01-06'
order: 780
assignee: voitb
---
## Description

Add input validation for the `--max-files` option in the discover command.

## Issue Details

**File**: `/packages/cli/src/commands/discover.ts:20`
**Confidence**: 90%
**Category**: Input Validation

The current code:
```typescript
const maxFiles = parseInt(options.maxFiles, 10);
```

`parseInt()` can return `NaN` if the user provides invalid input (e.g., `--max-files abc`). There's no validation for NaN, negative numbers, or zero.

## Acceptance Criteria

- [x] Validate that `--max-files` is a positive integer
- [x] Show helpful error message for invalid input
- [x] Exit with error code 2 for invalid input
- [x] Add test cases for invalid input

## Implementation

**File**: `packages/cli/src/commands/discover.ts`

```typescript
import { exitWithError } from '../exit-codes';

// After parsing the option:
const maxFiles = parseInt(options.maxFiles, 10);

if (isNaN(maxFiles) || maxFiles <= 0) {
  exitWithError('--max-files must be a positive integer (e.g., --max-files 10)');
}

if (maxFiles > 100) {
  exitWithError('--max-files cannot exceed 100 to prevent excessive API usage');
}
```

## Test

```bash
cd packages/cli && pnpm build

# Test invalid inputs
pnpm stargazer discover --max-files abc; echo "Exit: $?"
pnpm stargazer discover --max-files -5; echo "Exit: $?"
pnpm stargazer discover --max-files 0; echo "Exit: $?"
pnpm stargazer discover --max-files 500; echo "Exit: $?"
```

All should exit with code 2.
