---
id: task-083
title: Add --quiet and --verbose flags
status: done
priority: medium
labels:
  - cli
  - ux
created: '2026-01-06'
order: 830
assignee: voitb
---
## Description

Add verbosity control flags for CI environments and debugging.

## Issue Details

**Files**: All CLI command files
**Confidence**: 88%
**Category**: UX

No verbosity control exists. In CI environments, users often want minimal output. Conversely, for debugging, verbose output is valuable.

## Acceptance Criteria

- [x] Add global `--quiet` flag to suppress non-essential output
- [x] Add global `--verbose` flag for detailed output
- [x] Respect flags in all commands
- [x] Create logger utility that respects verbosity

## Implementation

**File**: `packages/cli/src/logger.ts`

```typescript
export type LogLevel = 'quiet' | 'normal' | 'verbose';

let currentLevel: LogLevel = 'normal';

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export const logger = {
  info: (message: string) => {
    if (currentLevel !== 'quiet') {
      console.log(message);
    }
  },

  debug: (message: string) => {
    if (currentLevel === 'verbose') {
      console.log(chalk.dim(`[debug] ${message}`));
    }
  },

  warn: (message: string) => {
    console.warn(chalk.yellow(`Warning: ${message}`));
  },

  error: (message: string) => {
    console.error(chalk.red(`Error: ${message}`));
  },

  success: (message: string) => {
    if (currentLevel !== 'quiet') {
      console.log(chalk.green(message));
    }
  },
};
```

**File**: `packages/cli/src/index.ts`

```typescript
import { setLogLevel } from './logger';

program
  .option('-q, --quiet', 'Suppress non-essential output')
  .option('-v, --verbose', 'Enable verbose output')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.quiet) setLogLevel('quiet');
    else if (opts.verbose) setLogLevel('verbose');
  });
```

## Test

```bash
cd packages/cli && pnpm build

# Test quiet mode (CI-friendly)
pnpm stargazer review --quiet

# Test verbose mode (debugging)
pnpm stargazer review --verbose
```
