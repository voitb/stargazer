---
id: task-090
title: Add CLI help examples
status: done
priority: low
labels:
  - cli
  - documentation
created: '2026-01-06'
order: 900
assignee: voitb
---
## Description

Add usage examples to CLI help output for better user experience.

## Issue Details

**File**: `/packages/cli/src/index.ts`
**Confidence**: 80%
**Category**: Documentation

While `commander` provides automatic help, the commands lack usage examples. Users benefit from seeing concrete examples in help output.

## Acceptance Criteria

- [x] Add examples to main help output
- [x] Add examples to each command's help
- [x] Follow consistent formatting

## Implementation

**File**: `packages/cli/src/index.ts`

```typescript
program
  .name('stargazer')
  .description('AI-powered code review using Google Gemini')
  .version('0.1.0')
  .addHelpText('after', `
Examples:
  $ stargazer init                      Initialize config file
  $ stargazer discover                  Analyze project conventions
  $ stargazer review                    Review staged changes
  $ stargazer review --unstaged         Review all uncommitted changes
  $ stargazer review -f json            Output as JSON for CI

Exit Codes:
  0  Success (no issues found)
  1  Issues found
  2  Error

Environment Variables:
  GEMINI_API_KEY    Google Gemini API key (required)
`);
```

**File**: `packages/cli/src/commands/review.ts`

```typescript
export const reviewCommand = new Command('review')
  .description('Review code changes using AI')
  // ... options ...
  .addHelpText('after', `
Examples:
  $ stargazer review                    Review staged changes
  $ stargazer review --unstaged         Review unstaged changes
  $ stargazer review -f json            Output as JSON
  $ stargazer review -f markdown > review.md
`);
```

## Test

```bash
cd packages/cli && pnpm build

# Check help outputs
pnpm stargazer --help
pnpm stargazer review --help
pnpm stargazer discover --help
```
