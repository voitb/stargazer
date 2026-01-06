---
id: task-070
title: Add proper exit codes
status: done
assignee: voitb
priority: medium
labels:
  - cli
created: '2026-01-01'
order: 700
---
## Description

Ensure consistent exit codes across all CLI commands.

## Acceptance Criteria

- [ ] Exit 0: Success with no issues
- [ ] Exit 1: Success with issues found
- [ ] Exit 2: Error (config, API, etc.)
- [ ] Document exit codes in help

## Implementation

**File**: `packages/cli/src/exit-codes.ts`

```typescript
/**
 * CLI exit codes.
 *
 * - 0: Success (no issues found)
 * - 1: Success with issues (code needs attention)
 * - 2: Error (configuration, API, or system error)
 */
export const EXIT_CODES = {
  /** No issues found */
  SUCCESS: 0,
  /** Issues found during review */
  ISSUES_FOUND: 1,
  /** Error occurred */
  ERROR: 2,
} as const;

export type ExitCode = typeof EXIT_CODES[keyof typeof EXIT_CODES];

/**
 * Exit with appropriate code based on review result.
 */
export function exitWithResult(issuesCount: number): never {
  process.exit(issuesCount > 0 ? EXIT_CODES.ISSUES_FOUND : EXIT_CODES.SUCCESS);
}

/**
 * Exit with error code.
 */
export function exitWithError(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(EXIT_CODES.ERROR);
}
```

**Update all commands to use these exit codes consistently.**

**Update**: `packages/cli/src/commands/review.ts`

```typescript
import { EXIT_CODES, exitWithError, exitWithResult } from '../exit-codes';

// Replace process.exit(2) with:
exitWithError(result.error.message);

// Replace process.exit(result.data.issues.length > 0 ? 1 : 0) with:
exitWithResult(result.data.issues.length);
```

**Update help text** in main CLI:

```typescript
program
  .name('stargazer')
  .description('AI-powered code review using Google Gemini')
  .version('0.1.0')
  .addHelpText('after', `
Exit Codes:
  0  Success (no issues found)
  1  Issues found
  2  Error
`);
```

## Test

```bash
cd packages/cli && pnpm build

# Test exit codes
GEMINI_API_KEY=xxx pnpm stargazer review; echo "Exit code: $?"

# Test help shows exit codes
pnpm stargazer --help
```
