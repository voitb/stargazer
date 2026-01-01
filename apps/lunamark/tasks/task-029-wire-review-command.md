---
id: task-029
title: Wire review command to CLI
status: todo
priority: medium
labels:
  - cli
created: '2026-01-01'
order: 290
---
## Description

Connect the review command to the main CLI program.

## Acceptance Criteria

- [ ] Update `packages/cli/src/index.ts`
- [ ] Import and add reviewCommand
- [ ] CLI shows review in --help

## Implementation

**File**: `packages/cli/src/index.ts`

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { reviewCommand } from './commands/review';

const program = new Command();

program
  .name('stargazer')
  .description('AI-powered code review using Google Gemini')
  .version('0.1.0');

// Add commands
program.addCommand(reviewCommand);

program.parse();
```

## Test

```bash
cd packages/cli && pnpm build
pnpm stargazer --help
```

Should show `review` command in help output.

```bash
pnpm stargazer review --help
```

Should show review command options.
