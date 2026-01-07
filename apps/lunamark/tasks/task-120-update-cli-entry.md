---
id: task-120
title: Update CLI entry point for TUI mode
status: completed
priority: high
labels:
  - cli
  - tui
created: '2025-01-06'
order: 120
assignee: glm
---

## Description

Rename the CLI entry point to TSX and add TUI mode detection logic.

## Acceptance Criteria

- [ ] Rename `packages/cli/src/index.ts` to `packages/cli/src/index.tsx`
- [ ] Add `--no-tui` flag to Commander program
- [ ] Add `shouldLaunchTUI()` function
- [ ] Launch TUI when: TTY + no command + no --no-tui flag
- [ ] Otherwise use existing Commander.js CLI

## Implementation

**File**: `packages/cli/src/index.tsx`

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { reviewCommand } from './commands/review.js';
import { createDiscoverCommand } from './commands/discover.js';
import { logger } from './logger.js';

const program = new Command();

program
  .name('stargazer')
  .description('AI-powered code review with convention learning')
  .version('0.1.0')
  .option('--no-tui', 'Run in non-interactive CLI mode')
  .option('-q, --quiet', 'Suppress non-essential output')
  .option('-v, --verbose', 'Enable verbose output');

// Add existing commands
program.addCommand(reviewCommand);
program.addCommand(createDiscoverCommand());

// Function to check if TUI should launch
function shouldLaunchTUI(): boolean {
  const args = process.argv.slice(2);
  const hasCommand = args.some(arg => !arg.startsWith('-'));
  const hasNoTuiFlag = args.includes('--no-tui');
  const isTTY = process.stdout.isTTY === true;

  // Launch TUI if: TTY terminal + no command given + no --no-tui flag
  return isTTY && !hasCommand && !hasNoTuiFlag;
}

// Main execution
async function main() {
  if (shouldLaunchTUI()) {
    // Dynamic import to avoid loading Ink when not needed
    const { startTUI } = await import('./tui/index.js');
    await startTUI();
  } else {
    program.parse();
  }
}

main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(2);
});
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli

# Build the package
pnpm build

# Test TUI mode (should launch TUI)
node dist/index.js

# Test CLI mode (should show help)
node dist/index.js --no-tui --help

# Test with command (should not launch TUI)
node dist/index.js review --help
```
