---
id: task-088
title: Add --config option to review command
status: done
priority: low
labels:
  - cli
  - commands
created: '2026-01-06'
order: 880
assignee: voitb
---
## Description

Add ability to specify an alternative configuration file path.

## Issue Details

**File**: `/packages/cli/src/commands/review.ts`
**Confidence**: 82%
**Category**: Feature

The `init` command creates `stargazer.config.ts`, but the `review` command has no `--config` option to specify an alternative config file path.

## Acceptance Criteria

- [x] Add `--config <path>` option to review command
- [x] Validate config file exists
- [x] Load and apply config from specified path
- [x] Default to `stargazer.config.ts` in project root

## Implementation

**File**: `packages/cli/src/commands/review.ts`

```typescript
export const reviewCommand = new Command('review')
  .description('Review staged changes using AI')
  .option('--unstaged', 'Review unstaged changes instead of staged')
  .option('-c, --config <path>', 'Path to config file', 'stargazer.config.ts')
  .option('-f, --format <format>', 'Output format: terminal, json, markdown', 'terminal')
  .option('-m, --model <model>', 'Gemini model to use')
  .action(async (options) => {
    // Load config from specified path
    const configPath = resolve(options.config);

    let config: StargazerConfig = {};
    try {
      const configModule = await import(configPath);
      config = configModule.default || configModule;
    } catch (e) {
      // Config file is optional, use defaults if not found
      if (options.config !== 'stargazer.config.ts') {
        // Only error if user explicitly specified a config
        exitWithError(`Config file not found: ${configPath}`);
      }
    }

    // Apply config...
  });
```

## Test

```bash
cd packages/cli && pnpm build

# Test with custom config
pnpm stargazer review --config ./my-config.ts

# Test with default config
pnpm stargazer review
```
