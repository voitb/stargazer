---
id: task-040
title: Add discover command to CLI
status: todo
priority: medium
labels:
  - cli
  - commands
created: '2026-01-01'
order: 400
---
## Description

Add the `discover` command to analyze and save project conventions.

## Acceptance Criteria

- [ ] Create `packages/cli/src/commands/discover.ts`
- [ ] Implement `discoverCommand` with Commander
- [ ] Show progress during discovery
- [ ] Save conventions to cache file

## Implementation

**File**: `packages/cli/src/commands/discover.ts`

```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import { createGeminiClient } from '@stargazer/core/gemini/client';
import { discoverConventions } from '@stargazer/core/conventions/discovery';
import { saveConventions, getConventionsPath } from '@stargazer/core/conventions/cache';

export const discoverCommand = new Command('discover')
  .description('Analyze project to discover coding conventions')
  .option('--files <number>', 'Number of files to analyze', '10')
  .action(async (options) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY environment variable is required');
      process.exit(2);
    }

    const projectDir = process.cwd();
    const fileLimit = parseInt(options.files, 10);

    console.log(chalk.blue('🔍 Analyzing project conventions...'));
    console.log(chalk.dim(`  Scanning up to ${fileLimit} code files\n`));

    try {
      const client = createGeminiClient(apiKey);
      const result = await discoverConventions(client, projectDir, { fileLimit });

      if (!result.ok) {
        console.error(chalk.red(`Error: ${result.error.message}`));
        process.exit(2);
      }

      // Save to cache
      const saveResult = await saveConventions(result.data, projectDir);
      if (!saveResult.ok) {
        console.error(chalk.red(`Error saving: ${saveResult.error.message}`));
        process.exit(2);
      }

      // Show results
      console.log(chalk.green('✓ Conventions discovered and saved!\n'));
      console.log(chalk.dim(`  File: ${getConventionsPath(projectDir)}`));
      console.log(chalk.dim(`  Patterns found: ${result.data.patterns.length}\n`));

      // List patterns
      console.log(chalk.bold('Detected Patterns:\n'));
      result.data.patterns.forEach((pattern, i) => {
        console.log(`${i + 1}. ${chalk.cyan(pattern.name)}`);
        console.log(`   ${pattern.description}\n`);
      });
    } catch (error) {
      console.error(chalk.red('Unexpected error:'), error);
      process.exit(2);
    }
  });
```

## Test

```bash
cd packages/cli && pnpm build
GEMINI_API_KEY=xxx pnpm stargazer discover
```

Should analyze project and save `.stargazer/conventions.json`.
