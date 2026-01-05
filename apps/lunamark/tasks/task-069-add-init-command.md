---
id: task-069
title: Add stargazer init command
status: todo
assignee: voitb
priority: medium
labels:
  - cli
  - commands
created: '2026-01-01'
order: 690
---
## Description

Add an init command to create a stargazer.config.ts file.

## Acceptance Criteria

- [ ] Create `packages/cli/src/commands/init.ts`
- [ ] Generate starter config file
- [ ] Don't overwrite existing config
- [ ] Show next steps after creation

## Implementation

**File**: `packages/cli/src/commands/init.ts`

```typescript
import { Command } from 'commander';
import { writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import chalk from 'chalk';

const CONFIG_TEMPLATE = `import { defineConfig, ignorePathsPlugin } from '@stargazer/core';

export default defineConfig({
  // Gemini model to use
  model: 'gemini-2.0-flash',

  // Minimum severity to report
  minSeverity: 'low',

  // Maximum issues to report
  maxIssues: 20,

  // Paths to ignore (in addition to defaults)
  ignore: [
    '**/test/**',
    '**/*.test.ts',
  ],

  // Plugins
  plugins: [
    // Example: ignore legacy code
    // ignorePathsPlugin({ paths: ['/legacy/'] }),
  ],
});
`;

export const initCommand = new Command('init')
  .description('Initialize Stargazer configuration file')
  .option('--force', 'Overwrite existing config file')
  .action(async (options) => {
    const configPath = join(process.cwd(), 'stargazer.config.ts');

    // Check if config already exists
    if (!options.force) {
      try {
        await access(configPath);
        console.error(chalk.yellow('Config file already exists: stargazer.config.ts'));
        console.error(chalk.dim('Use --force to overwrite'));
        process.exit(1);
      } catch {
        // File doesn't exist, continue
      }
    }

    try {
      await writeFile(configPath, CONFIG_TEMPLATE, 'utf-8');

      console.log(chalk.green('✓ Created stargazer.config.ts'));
      console.log('');
      console.log(chalk.bold('Next steps:'));
      console.log('');
      console.log('  1. Set your API key:');
      console.log(chalk.cyan('     export GEMINI_API_KEY=your-key'));
      console.log('');
      console.log('  2. Discover project conventions:');
      console.log(chalk.cyan('     stargazer discover'));
      console.log('');
      console.log('  3. Review your code:');
      console.log(chalk.cyan('     git add . && stargazer review'));
      console.log('');
    } catch (error) {
      console.error(chalk.red('Failed to create config file:'), error);
      process.exit(2);
    }
  });
```

**Update** `packages/cli/src/index.ts`:

```typescript
import { initCommand } from './commands/init';
program.addCommand(initCommand);
```

## Test

```bash
cd packages/cli && pnpm build
pnpm stargazer init
cat stargazer.config.ts
```

Should create a starter config file.
