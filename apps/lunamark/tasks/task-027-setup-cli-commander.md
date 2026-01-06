---
id: task-027
title: Setup CLI package with commander
status: done
assignee: voitb
priority: high
labels:
  - cli
created: '2026-01-01'
order: 270
---
## Description

Set up the CLI package with Commander.js for command parsing.

## Acceptance Criteria

- [x] Create `packages/cli/src/index.ts`
- [x] Initialize Commander program
- [x] Add basic --version and --help
- [x] CLI entry point works

## Implementation

**File**: `packages/cli/src/index.ts`

```typescript
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('stargazer')
  .description('AI-powered code review using Google Gemini')
  .version('0.1.0');

program.parse();
```

**File**: `packages/cli/package.json` (ensure these fields exist)

```json
{
  "name": "@stargazer/cli",
  "version": "0.1.0",
  "bin": {
    "stargazer": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "@stargazer/core": "workspace:*"
  }
}
```

## Test

```bash
cd packages/cli && pnpm build
pnpm stargazer --help
```

Should show help text with description and version.
