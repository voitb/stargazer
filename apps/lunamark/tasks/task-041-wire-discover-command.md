---
id: task-041
title: Wire discover command
status: done
assignee: voitb
priority: low
labels:
  - cli
created: '2026-01-01'
order: 410
---
## Description

Connect the discover command to the main CLI program.

## Acceptance Criteria

- [x] Update `packages/cli/src/index.ts`
- [x] Import and add discoverCommand
- [x] CLI shows discover in --help

## Implementation

**File**: `packages/cli/src/index.ts`

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { reviewCommand } from './commands/review';
import { discoverCommand } from './commands/discover';

const program = new Command();

program
  .name('stargazer')
  .description('AI-powered code review using Google Gemini')
  .version('0.1.0');

// Add commands
program.addCommand(reviewCommand);
program.addCommand(discoverCommand);

program.parse();
```

## Test

```bash
cd packages/cli && pnpm build
pnpm stargazer --help
```

Should show both `review` and `discover` commands in help output.

```bash
pnpm stargazer discover --help
```

Should show discover command options.
